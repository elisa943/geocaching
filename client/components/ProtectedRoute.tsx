// components/ProtectedRoute.tsx
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuth();

  useEffect(() => {
      if (authStatus === 'unauthenticated') {
        router.replace('/');
      }
  }, [authStatus]);
  
  if (authStatus === 'checking') {
      return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  if (authStatus === 'unauthenticated') {
      return null; // on attend que le useEffect fasse la redirection
  }

  return <>{children}</>;
}

