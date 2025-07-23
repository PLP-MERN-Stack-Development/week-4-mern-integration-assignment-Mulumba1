import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { postService, categoryService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ImagePlus } from 'lucide-react';

const postSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  content: z.string()
    .min(20, 'Content must be at least 20 characters'),
  category: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function PostForm() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
    },
  });

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (error) {
        toast.error('Failed to load categories');
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // If in edit mode, fetch the post data
  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        try {
          const response = await postService.getPost(id);
          const post = response.data;
          
          form.reset({
            title: post.title,
            content: post.content,
            category: post.category?._id || '',
          });
          
          if (post.image) {
            setImagePreview(post.image);
          }
        } catch (error) {
          toast.error('Failed to load post');
          console.error('Error fetching post:', error);
          navigate('/posts');
        }
      }
    };
    
    if (isEditMode) {
      fetchPost();
    }
  }, [id, form, navigate, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PostFormValues) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to create a post');
      navigate('/login');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let response;
      
      if (isEditMode) {
        // Update existing post
        response = await postService.updatePost(id!, data);
        
        // Upload image if selected
        if (selectedImage) {
          const formData = new FormData();
          formData.append('image', selectedImage);
          await postService.uploadPostImage(id!, formData);
        }
        
        toast.success('Post updated successfully');
      } else {
        // Create new post
        response = await postService.createPost(data);
        
        // Upload image if selected
        if (selectedImage && response.data._id) {
          const formData = new FormData();
          formData.append('image', selectedImage);
          await postService.uploadPostImage(response.data._id, formData);
        }
        
        toast.success('Post created successfully');
      }
      
      navigate(`/posts/${response.data._id}`);
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update post' : 'Failed to create post');
      console.error('Post submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your post content..." 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block mb-2">Featured Image</FormLabel>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border border-input">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-center w-full">
                  <label 
                    htmlFor="dropzone-file" 
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {imagePreview ? 'Change image' : 'Upload an image'}
                      </p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <CardFooter className="px-0 pt-4 flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? 'Update Post' : 'Publish Post'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}