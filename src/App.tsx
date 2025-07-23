import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Contexts
import { AuthProvider } from '@/context/AuthContext';

// Layout
import Layout from '@/components/layout/Layout';

// Pages
import Home from '@/pages/Home';
import AuthPages from '@/pages/AuthPages';
import PostPages from '@/pages/PostPages';
import CategoryPages from '@/pages/CategoryPages';
import UserPages from '@/pages/UserPages';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<AuthPages type="login" />} />
              <Route path="/register" element={<AuthPages type="register" />} />
              
              {/* Post Routes */}
              <Route path="/posts" element={<PostPages type="list" />} />
              <Route path="/posts/:id" element={<PostPages type="detail" />} />
              <Route path="/posts/new" element={<PostPages type="create" />} />
              <Route path="/posts/edit/:id" element={<PostPages type="edit" />} />
              <Route path="/my-posts" element={<PostPages type="list" />} />
              
              {/* Category Routes */}
              <Route path="/categories" element={<CategoryPages type="list" />} />
              <Route path="/categories/:slug" element={<CategoryPages type="detail" />} />
              <Route path="/categories/new" element={<CategoryPages type="create" />} />
              <Route path="/categories/edit/:id" element={<CategoryPages type="edit" />} />
              
              {/* User Routes */}
              <Route path="/users/:id" element={<UserPages type="profile" />} />
              <Route path="/profile/edit" element={<UserPages type="edit" />} />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;