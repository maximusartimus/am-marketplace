import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client - for use in client components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get the current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Helper to get the current user
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}


