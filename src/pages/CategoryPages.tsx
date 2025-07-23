import { useParams } from 'react-router-dom';
import CategoryList from '@/components/category/CategoryList';
import CategoryForm from '@/components/category/CategoryForm';
import PostList from '@/components/post/PostList';

interface CategoryPagesProps {
  type: 'list' | 'detail' | 'create' | 'edit';
}

export default function CategoryPages({ type }: CategoryPagesProps) {
  const { slug, id } = useParams<{ slug: string; id: string }>();

  return (
    <div className="py-4">
      {type === 'list' && <CategoryList />}
      {type === 'detail' && <PostList categorySlug={slug} />}
      {(type === 'create' || type === 'edit') && <CategoryForm />}
    </div>
  );
}