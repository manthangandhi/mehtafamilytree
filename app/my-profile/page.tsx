import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import MyProfileForm from './MyProfileForm';

export default async function MyProfilePage() {
  const current = await getCurrentUserProfile();

  if (!current?.profile || current.profile.status !== 'approved') {
    redirect('/dashboard?status=pending');
  }

  const initialData = {
    id: current.profile.id,
    full_name: current.profile.full_name,
    mobile_number: current.profile.mobile_number,
    whatsapp_number: null, // extend profile if needed in future
    email: current.email,
  };

  return <MyProfileForm initialData={initialData} />;
}
