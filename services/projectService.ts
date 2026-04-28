
import { supabase } from './supabaseClient';
import { Project, Message, UserSettings, User } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { normalizeProject, normalizeProjects } from './generatedData';

// Local storage is now strictly a fallback if Supabase creds are missing entirely
const LOCAL_STORAGE_KEY = 'saas_validator_projects';
const LOCAL_SETTINGS_KEY = 'saas_validator_settings';

const getLocalProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? normalizeProjects(JSON.parse(stored)) : [];
  } catch (e) {
    console.error("Local storage read error", e);
    return [];
  }
};

const saveLocalProject = (project: Project): Project[] => {
  try {
    const projects = getLocalProjects();
    const normalizedProject = normalizeProject(project);
    const updated = [normalizedProject, ...projects.filter(p => p.id !== project.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Local storage write error", e);
    return [];
  }
};

// --- Sync User Profile ---
// This ensures that when a user logs in via Auth, their profile exists in the public table
export const syncUserProfile = async (user: User) => {
    if (!supabase || user.id === 'guest') return;

    try {
        // Check if profile exists
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
            // Derive display name from metadata (Google) or email
            const rawMeta = (user as any).user_metadata || {};
            const displayName = rawMeta.full_name || rawMeta.name || user.email?.split('@')[0] || 'Developer';
            
            // Insert new profile
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    display_name: displayName,
                    job_title: 'Product Builder', // Default
                    theme: 'dark',
                    agent_persona: 'friendly',
                    updated_at: new Date().toISOString()
                });
            
            if (error) console.warn('Error syncing profile:', error);
        }
    } catch (e) {
        console.error('Profile sync failed', e);
    }
};

// --- Projects ---

export const getProjects = async (userId: string): Promise<Project[]> => {
  if (!supabase) return getLocalProjects();

  try {
    // RLS will automatically filter by the authenticated user
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return normalizeProjects(data as any || []);
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to local:', err);
    return getLocalProjects();
  }
};

export const saveProject = async (project: Project, userId: string): Promise<Project | null> => {
  // Save locally as backup immediately
  const normalizedProject = normalizeProject(project);
  saveLocalProject(normalizedProject);

  if (!supabase || userId === 'guest' || userId.startsWith('guest-')) return normalizedProject;

  try {
    const { data, error } = await supabase
      .from('projects')
      .upsert({
        id: normalizedProject.id,
        user_id: userId,
        name: normalizedProject.name,
        description: normalizedProject.description,
        data: normalizedProject.data, // This JSONB column holds the entire application state
        created_at: normalizedProject.created_at
      })
      .select()
      .single();

    if (error) throw error;
    return normalizeProject(data as any);
  } catch (err) {
    console.error('Supabase save failed:', err);
    return normalizedProject; // Return the optimistic update
  }
};

export const deleteProject = async (projectId: string, userId: string) => {
    // Delete local first
    try {
        const projects = getLocalProjects();
        const updated = projects.filter(p => p.id !== projectId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) { console.error(e); }

    if (!supabase || userId === 'guest' || userId.startsWith('guest-')) return true;

    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId); // RLS handles user check, but ID check is good
        
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Supabase delete failed:', err);
        return true;
    }
}

// --- User Settings (Profiles) ---

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  if (!supabase) {
      try {
          const stored = localStorage.getItem(`${LOCAL_SETTINGS_KEY}_${userId}`);
          return stored ? JSON.parse(stored) : null;
      } catch (e) { return null; }
  }

  try {
      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
      
      if (error) {
          // If profile doesn't exist, it's not a critical error, just return null to use defaults
          if (error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
             console.warn('Failed to fetch profile:', error.message);
          }
          return null;
      }
      
      return {
          displayName: data.display_name,
          jobTitle: data.job_title,
          theme: data.theme as any,
          agentPersona: data.agent_persona as any,
          notifications: data.notifications
      };
  } catch (e) {
      console.warn('Failed to fetch profile', e);
      return null;
  }
};

export const saveUserSettings = async (userId: string, settings: UserSettings): Promise<UserSettings | null> => {
    // Local fallback
    try {
        localStorage.setItem(`${LOCAL_SETTINGS_KEY}_${userId}`, JSON.stringify(settings));
    } catch(e) {}

    // Skip Supabase for guest users to prevent RLS errors
    if (!supabase || userId === 'guest' || userId.startsWith('guest-')) return settings;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                display_name: settings.displayName,
                job_title: settings.jobTitle,
                theme: settings.theme,
                agent_persona: settings.agentPersona,
                notifications: settings.notifications,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return settings;
    } catch (e: any) {
        console.error('Failed to save profile to Supabase:', e.message || JSON.stringify(e));
        return settings;
    }
};

// --- Realtime Subscriptions ---

export const subscribeToProject = (projectId: string, callback: (payload: any) => void): RealtimeChannel | null => {
  if (!supabase || !projectId) return null;

  console.log(`Subscribing to project: ${projectId}`);
  const channel = supabase
    .channel(`project-${projectId}`)
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'projects', 
        filter: `id=eq.${projectId}` 
      },
      (payload) => {
        // payload.new contains the updated row
        callback(normalizeProject(payload.new as any));
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Realtime connected for project updates.');
      }
    });

  return channel;
};

export const subscribeToMessages = (projectId: string, callback: (payload: any) => void): RealtimeChannel | null => {
  if (!supabase || !projectId) return null;

  return supabase
    .channel(`messages-${projectId}`)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `project_id=eq.${projectId}` 
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};

// --- Message CRUD ---

export const getMessages = async (projectId: string): Promise<Message[]> => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.warn('Failed to fetch messages:', error);
    return [];
  }
  return data as Message[];
};

export const sendMessage = async (projectId: string, role: 'user' | 'model', content: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      project_id: projectId,
      role,
      content
    })
    .select()
    .single();

  if (error) console.warn('Failed to send message:', error);
  return data;
};
