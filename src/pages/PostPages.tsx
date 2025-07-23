import { useParams } from 'react-router-dom';
import PostList from '@/components/post/PostList';
import PostDetail from '@/components/post/PostDetail';
import PostForm from '@/components/post/PostForm';

interface PostPagesProps {
  type: 'list' | 'detail' | 'create' | 'edit';
}

export default function PostPages({ type }: PostPagesProps) {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="py-4">
      {type === 'list' && <PostList />}
      {type === 'detail' && <PostDetail />}
      {(type === 'create' || type === 'edit') && <PostForm />}
    </div>
  );
}