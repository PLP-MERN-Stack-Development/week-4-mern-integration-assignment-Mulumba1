import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

import { postService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ThumbsUp, 
  MessageSquare, 
  Calendar, 
  Edit, 
  Trash, 
  Loader2 
} from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postService.getPost(id!);
        setPost(response.data);
      } catch (error) {
        toast.error('Failed to load post');
        console.error('Error fetching post:', error);
        navigate('/posts');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to like posts');
      return;
    }

    try {
      setIsLiking(true);
      let response;

      if (post.likes.includes(user?._id)) {
        response = await postService.unlikePost(post._id);
      } else {
        response = await postService.likePost(post._id);
      }

      setPost(response.data);
    } catch (error) {
      toast.error('Failed to update like');
      console.error('Like error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('You must be logged in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setIsSubmittingComment(true);
      const response = await postService.addComment(post._id, { text: commentText });
      setPost(response.data);
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Comment error:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await postService.deleteComment(post._id, commentId);
      setPost(response.data);
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Delete comment error:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await postService.deletePost(post._id);
      toast.success('Post deleted successfully');
      navigate('/posts');
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Delete post error:', error);
    }
  };

  // Format date helpers
  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getFormattedDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  // Get the user's initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/posts')}>Back to Posts</Button>
      </div>
    );
  }

  const isAuthor = user && post.user && user._id === post.user._id;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-none border-0">
        <CardHeader className="px-0 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              {post.category && (
                <Link to={`/categories/${post.category.slug}`}>
                  <Badge variant="secondary" className="mb-2 hover:bg-secondary/80">
                    {post.category.name}
                  </Badge>
                </Link>
              )}
              <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
            </div>
            
            {isAuthor && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/posts/edit/${post._id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your post
                        and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeletePost} 
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                {post.user?.avatar && <img src={post.user.avatar} alt={post.user.name} />}
                <AvatarFallback>{getInitials(post.user?.name || "User")}</AvatarFallback>
              </Avatar>
              <Link to={`/users/${post.user?._id}`} className="hover:text-foreground">
                {post.user?.name || "Unknown User"}
              </Link>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{getFormattedDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.comments?.length || 0} comments</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 space-y-6">
          {post.image && (
            <div className="w-full rounded-md overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}
          
          <div className="prose prose-blue max-w-none">
            {/* Split content by paragraphs and render them */}
            {post.content.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant={post.likes?.includes(user?._id) ? "default" : "outline"} 
              size="sm"
              disabled={!isAuthenticated || isLiking}
              onClick={handleLike}
              className="space-x-2"
            >
              {isLiking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
              )}
              <span>{post.likes?.length || 0} {post.likes?.length === 1 ? 'Like' : 'Likes'}</span>
            </Button>
          </div>
          
          <Separator />
          
          {/* Comments section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Comments</h3>
            
            {/* Add comment form */}
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <Textarea
                  placeholder="Add your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmittingComment}
                />
                <Button 
                  type="submit" 
                  disabled={isSubmittingComment || !commentText.trim()}
                >
                  {isSubmittingComment && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Post Comment
                </Button>
              </form>
            ) : (
              <div className="bg-muted p-4 rounded-md text-center">
                <p className="mb-2">Please sign in to leave a comment</p>
                <Button onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
            )}
            
            {/* Comments list */}
            <div className="space-y-4 mt-6">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment: any) => (
                  <Card key={comment._id}>
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          {comment.user?.avatar && <img src={comment.user.avatar} alt={comment.user.name} />}
                          <AvatarFallback>{getInitials(comment.user?.name || "User")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {comment.user?.name || "Unknown User"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getTimeAgo(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      {(user?._id === comment.user?._id || user?._id === post.user?._id) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteComment(comment._id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p>{comment.text}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-0 pt-4 border-t">
          <Button variant="outline" onClick={() => navigate('/posts')}>
            Back to Posts
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}