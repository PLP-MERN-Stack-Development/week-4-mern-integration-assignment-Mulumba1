import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for adding token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User Services
export const userService = {
  getUserProfile: async (id: string) => {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  }
};

// Authentication Services
export const authService = {
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateUserDetails: async (userData: { name?: string; bio?: string }) => {
    const response = await api.put('/auth/updatedetails', userData);
    return response.data;
  },
  
  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    return response.data;
  }
};

// Posts Services
export const postService = {
  getPosts: async (params?: any) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },
  
  getUserPosts: async (userId: string) => {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },
  
  getPost: async (id: string) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },
  
  createPost: async (postData: any) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },
  
  updatePost: async (id: string, postData: any) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },
  
  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  
  uploadPostImage: async (id: string, formData: FormData) => {
    const response = await api.put(`/posts/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  likePost: async (id: string) => {
    const response = await api.put(`/posts/${id}/like`);
    return response.data;
  },
  
  unlikePost: async (id: string) => {
    const response = await api.put(`/posts/${id}/unlike`);
    return response.data;
  },
  
  addComment: async (id: string, commentData: { text: string }) => {
    const response = await api.post(`/posts/${id}/comments`, commentData);
    return response.data;
  },
  
  deleteComment: async (postId: string, commentId: string) => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  }
};

// Category Services
export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getCategory: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  createCategory: async (categoryData: { name: string }) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (id: string, categoryData: { name: string }) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default api;