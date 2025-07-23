import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

interface AuthPagesProps {
  type: 'login' | 'register';
}

export default function AuthPages({ type }: AuthPagesProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="py-8">
      {type === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}