import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../components/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuth();

  if (authStatus === 'checking') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <Redirect href="/" />; // Redirige directement dans le render
  }

  return <>{children}</>;
}
