import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';

import { postService, categoryService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function PostList() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  
  // Pagination
  const currentPage = Number(searchParams.get('page') || '1');
  const limit = 10;

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch posts based on filters and pagination
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        const params: any = {
          page: currentPage,
          limit,
        };
        
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        
        const response = await postService.getPosts(params);
        setPosts(response.data.posts);
        setTotalPosts(response.data.totalPosts);
        setTotalPages(Math.ceil(response.data.totalPosts / limit));
      } catch (error) {
        toast.error('Failed to load posts');
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [currentPage, searchTerm, selectedCategory]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search: searchTerm, page: '1' });
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    updateSearchParams({ category: value, page: '1' });
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSearchParams({});
  };
  
  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };
  
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    updateSearchParams({ page: page.toString() });
  };

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    // Always show the first page
    pageNumbers.push(1);
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      pageNumbers.push('ellipsis1');
    }
    
    // Add pages around the current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2 && totalPages > maxPagesToShow) {
      pageNumbers.push('ellipsis2');
    }
    
    // Always show the last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        
        {isAuthenticated && (
          <Link to="/posts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </Link>
        )}
      </div>
      
      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          
          <Select 
            value={selectedCategory} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Active filters */}
        <div className="flex items-center flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="px-2 py-1">
              Search: {searchTerm}
            </Badge>
          )}
          
          {selectedCategory && selectedCategory !== 'all' && categories.length > 0 && (
            <Badge variant="secondary" className="px-2 py-1">
              Category: {categories.find(c => c._id === selectedCategory)?.name}
            </Badge>
          )}
          
          {(searchTerm || selectedCategory) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="h-7 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Posts grid or loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No posts found</h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filters' 
              : 'Be the first to create a post'}
          </p>
          
          {isAuthenticated && (
            <Link to="/posts/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Post
              </Button>
            </Link>
          )}
        </div>
      )}
      
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination className="my-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => goToPage(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, index) => {
              if (page === 'ellipsis1' || page === 'ellipsis2') {
                return (
                  <PaginationItem key={`${page}-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink
                    onClick={() => goToPage(Number(page))}
                    isActive={currentPage === Number(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => goToPage(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}