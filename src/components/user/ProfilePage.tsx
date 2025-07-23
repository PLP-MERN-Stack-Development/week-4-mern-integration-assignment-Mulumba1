import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';

import { userService, postService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

import PostCard from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Calendar, Mail, MapPin, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  // Check if the profile being viewed belongs to the current user
  const isOwnProfile = currentUser && id === currentUser._id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserProfile(id!);
        setUser(response.data);
      } catch (error) {
        toast.error('Failed to load user profile');
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await postService.getUserPosts(id!);
        setUserPosts(response.data);
      } catch (error) {
        toast.error('Failed to load user posts');
        console.error('Error fetching user posts:', error);
      } finally {
        setPostsLoading(false);
      }
    };

    if (id && user) {
      fetchUserPosts();
    }
  }, [id, user]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get user initials for avatar
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

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <Avatar className="w-24 h-24 border-2 border-primary">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
                )}
              </Avatar>
              
              <div>
                <CardTitle className="text-2xl mb-1 text-center sm:text-left">{user.name}</CardTitle>
                <CardDescription className="text-center sm:text-left flex items-center gap-1">
                  <Mail className="h-4 w-4" /> {user.email}
                </CardDescription>
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3 justify-center sm:justify-start">
                  {user.location && (
                    <span className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            {isOwnProfile && (
              <Button asChild>
                <Link to="/profile/edit">Edit Profile</Link>
              </Button>
            )}
          </div>
          
          {user.bio && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-muted-foreground">{user.bio}</p>
            </div>
          )}
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts ({userPosts.length})</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-6">
          <h2 className="text-xl font-semibold">Posts by {user.name}</h2>
          <Separator />
          
          {postsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : userPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {isOwnProfile ? "You haven't created any posts yet." : "This user hasn't created any posts yet."}
              </p>
              {isOwnProfile && (
                <Button className="mt-4" asChild>
                  <Link to="/posts/new">Create Your First Post</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About {user.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.bio ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Bio</h3>
                  <p>{user.bio}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No bio provided</p>
              )}
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  {user.website && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a 
                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{userPosts.length}</p>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.commentsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Comments Made</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}