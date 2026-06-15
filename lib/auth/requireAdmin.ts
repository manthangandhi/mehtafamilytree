import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from './getCurrentUserProfile';

/**
 * Server-side guard for admin-only routes.
 * Redirects to /login or shows appropriate message.
 * Call at the top of server components or actions.
 */
export async function requireAdmin() {
  const current = await getCurrentUserProfile();

  if (!current || !current.profile) {
    redirect('/login?redirectedFrom=admin');
  }

  if (current.profile.role !== 'admin' || current.profile.status !== 'approved') {
    // Send non-admins to dashboard with message
    redirect('/dashboard?error=admin-required');
  }

  return current;
}
