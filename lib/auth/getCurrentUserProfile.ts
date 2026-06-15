import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type UserRole = 'member' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface CurrentUser {
  id: string;
  email: string | null;
  emailConfirmed: boolean;
  profile: Profile | null;
}

/**
 * Get the currently authenticated user + their profile row.
 * Returns null profile if not logged in or no profile row.
 */
export async function getCurrentUserProfile(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const emailConfirmed = !!user.email_confirmed_at;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    // Profile might not exist yet in rare race conditions
    console.warn('Profile not found for user', user.id);
    return {
      id: user.id,
      email: user.email ?? null,
      emailConfirmed,
      profile: null,
    };
  }

  return {
    id: user.id,
    email: user.email ?? null,
    emailConfirmed,
    profile,
  };
}
