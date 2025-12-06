export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gadmqfzwecysxadsobjr.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZG1xZnp3ZWN5c3hhZHNvYmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDkwMzEsImV4cCI6MjA4MDQ4NTAzMX0.SZU7-PbEWLdKtZ0IF0Tio4aAeTnzcLJHiK_p6X4tNtk';

export const MOCK_USER_ID = 'guest-user-123';

export const INITIAL_KANBAN_COLUMNS = {
  'column-1': { id: 'column-1', title: 'Backlog', items: [] },
  'column-2': { id: 'column-2', title: 'To Do', items: [] },
  'column-3': { id: 'column-3', title: 'In Progress', items: [] },
  'column-4': { id: 'column-4', title: 'Review', items: [] },
  'column-5': { id: 'column-5', title: 'Done', items: [] },
};

export const INITIAL_COLUMN_ORDER = ['column-1', 'column-2', 'column-3', 'column-4', 'column-5'];