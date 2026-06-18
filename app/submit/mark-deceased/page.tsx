import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import MarkDeceasedClient from './MarkDeceasedClient';

export default async function MarkDeceasedPage() {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    redirect('/login?next=/submit/mark-deceased');
  }
  return <MarkDeceasedClient />;
}

