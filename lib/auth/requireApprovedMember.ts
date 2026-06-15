import { redirect } from 'next/navigation';
import { getCurrentUserProfile, CurrentUser } from './getCurrentUserProfile';

/**
 * Server-side guard for pages that require an approved member (or admin).
 * Pending / rejected / blocked users are sent to a special state page.
 */
export async function requireApprovedMember(): Promise<CurrentUser> {
  const current = await getCurrentUserProfile();

  if (!current || !current.profile) {
    redirect('/login');
  }

  const { profile } = current;

  if (profile.status === 'pending') {
    redirect('/dashboard?status=pending');
  }

  if (profile.status === 'rejected' || profile.status === 'blocked') {
    redirect('/dashboard?status=blocked');
  }

  if (profile.role !== 'member' && profile.role !== 'admin') {
    redirect('/dashboard?error=invalid-role');
  }

  return current;
}
