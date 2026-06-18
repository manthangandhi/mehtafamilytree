import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import CorrectionFormClient from './CorrectionFormClient';

export default async function SubmitCorrectionPage() {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    redirect('/login?next=/submit/correction');
  }
  return <CorrectionFormClient />;
}

