export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

export const MOCK_USER_ID = 'guest-user-123';

export const INITIAL_KANBAN_COLUMNS = {
  'column-1': { id: 'column-1', title: 'Backlog', items: [] },
  'column-2': { id: 'column-2', title: 'To Do', items: [] },
  'column-3': { id: 'column-3', title: 'In Progress', items: [] },
  'column-4': { id: 'column-4', title: 'Review', items: [] },
  'column-5': { id: 'column-5', title: 'Done', items: [] },
};

export const INITIAL_COLUMN_ORDER = ['column-1', 'column-2', 'column-3', 'column-4', 'column-5'];