import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    image?: string;
    category?: {
      _id: string;
      name: string;
      slug: string;
    };
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    comments: Array<any>;
    likes: Array<string>;
    createdAt: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  // Create a truncated version of the content for preview
  const contentPreview = post.content.length > 150 
    ? post.content.slice(0, 150) + '...' 
    : post.content;

  // Get the user's initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {post.image && (
        <Link to={`/posts/${post._id}`} className="block overflow-hidden h-48">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </Link>
      )}
      
      <CardHeader className="pb-3">
        <div className="space-y-2">
          {post.category && (
            <Link to={`/categories/${post.category.slug}`}>
              <Badge variant="secondary" className="hover:bg-secondary/80">
                {post.category.name}
              </Badge>
            </Link>
          )}
          <Link to={`/posts/${post._id}`} className="block">
            <h3 className="text-xl font-semibold hover:text-blue-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        <p className="text-muted-foreground line-clamp-3">{contentPreview}</p>
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              {post.user.avatar && <img src={post.user.avatar} alt={post.user.name} />}
              <AvatarFallback className="text-xs">
                {getInitials(post.user.name)}
              </AvatarFallback>
            </Avatar>
            <Link to={`/users/${post.user._id}`} className="hover:text-foreground">
              {post.user.name}
            </Link>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{post.likes.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments.length}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}