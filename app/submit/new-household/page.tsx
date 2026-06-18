import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import SubmitNewHouseholdClient from './SubmitNewHouseholdClient';

export default async function SubmitNewHouseholdPage() {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    redirect('/login?next=/submit/new-household');
  }

  return <SubmitNewHouseholdClient />;
}

