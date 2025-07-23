import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { postService, categoryService } from '@/services/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PostCard from '@/components/post/PostCard';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronRight } from 'lucide-react';

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent posts
        const recentResponse = await postService.getPosts({ 
          page: 1, 
          limit: 6,
          sort: '-createdAt' 
        });
        setRecentPosts(recentResponse.data.posts);
        
        // Fetch popular posts (most liked)
        const popularResponse = await postService.getPosts({ 
          page: 1, 
          limit: 3,
          sort: '-likes' 
        });
        setPopularPosts(popularResponse.data.posts);
        
        // Fetch categories
        const categoriesResponse = await categoryService.getCategories();
        setCategories(categoriesResponse.data);
      } catch (error) {
        toast.error('Failed to load content');
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Share Your Knowledge & Ideas</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Join our community of writers and readers, and start sharing your thoughts with the world.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/posts">Browse Posts</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-white border-white hover:bg-white/10">
              <Link to="/register">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/posts" className="flex items-center">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No posts found</p>
              <Button className="mt-4" asChild>
                <Link to="/posts/new">Create the first post</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Popular Posts and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Posts */}
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Popular Posts</h2>
          
          {popularPosts.length > 0 ? (
            <div className="space-y-6">
              {popularPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No popular posts yet</p>
              </CardContent>
            </Card>
          )}
        </section>
        
        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Categories</h2>
          
          <Card>
            <CardContent className="pt-6">
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Link key={category._id} to={`/categories/${category.slug}`}>
                      <Badge variant="secondary" className="px-3 py-1 text-sm hover:bg-secondary/80">
                        {category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No categories found</p>
              )}
              
              <div className="mt-6 pt-6 border-t">
                <Link to="/categories" className="flex items-center justify-center text-sm text-blue-600 hover:underline">
                  View All Categories <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">About BlogMERN</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A full-stack blog application built with MongoDB, Express, React, and Node.js.
                  Join our community to share knowledge and connect with others.
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/about">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}