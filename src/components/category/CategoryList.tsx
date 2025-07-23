import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { categoryService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Edit, Plus, Trash, Loader2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export default function CategoryList() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (error) {
        toast.error('Failed to load categories');
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(category => category._id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Delete category error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
        
        {isAdmin && (
          <Link to="/categories/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </Link>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Browse and manage blog categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px] text-center">Posts</TableHead>
                    {isAdmin && <TableHead className="w-[100px] text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/categories/${category.slug}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {category.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {category.description || 
                            <span className="text-muted-foreground italic">No description</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {category.postCount || 0}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link to={`/categories/edit/${category._id}`}>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the category "{category.name}".
                                      {category.postCount > 0 && 
                                        ` ${category.postCount} posts are assigned to this category and will be updated to have no category.`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCategory(category._id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-6">
                        <p className="text-muted-foreground">No categories found</p>
                        {isAdmin && (
                          <Button 
                            variant="link" 
                            asChild 
                            className="mt-2"
                          >
                            <Link to="/categories/new">Create your first category</Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Total categories: {categories.length}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}