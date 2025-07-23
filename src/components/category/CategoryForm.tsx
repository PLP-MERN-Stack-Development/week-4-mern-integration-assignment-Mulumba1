import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { categoryService } from '@/services/api';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoryForm() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // If in edit mode, fetch the category data
  useEffect(() => {
    const fetchCategory = async () => {
      if (id) {
        try {
          const response = await categoryService.getCategory(id);
          const category = response.data;
          
          form.reset({
            name: category.name,
            description: category.description || '',
          });
        } catch (error) {
          toast.error('Failed to load category');
          console.error('Error fetching category:', error);
          navigate('/categories');
        }
      }
    };
    
    if (isEditMode) {
      fetchCategory();
    }
  }, [id, form, navigate, isEditMode]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to manage categories');
      navigate('/login');
      return;
    }

    // Check if user is admin (in a real app, this would be based on user roles)
    if (user?.role !== 'admin') {
      toast.error('You do not have permission to manage categories');
      navigate('/categories');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        // Update existing category
        await categoryService.updateCategory(id!, data);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await categoryService.createCategory(data);
        toast.success('Category created successfully');
      }
      
      navigate('/categories');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update category' : 'Failed to create category');
      console.error('Category submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Category' : 'Create New Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a short description for this category" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pt-4 flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/categories')}
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
                {isEditMode ? 'Update Category' : 'Create Category'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}