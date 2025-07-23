import { useParams } from 'react-router-dom';
import ProfilePage from '@/components/user/ProfilePage';
import EditProfile from '@/components/user/EditProfile';

interface UserPagesProps {
  type: 'profile' | 'edit';
}

export default function UserPages({ type }: UserPagesProps) {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="py-4">
      {type === 'profile' && <ProfilePage />}
      {type === 'edit' && <EditProfile />}
    </div>
  );
}