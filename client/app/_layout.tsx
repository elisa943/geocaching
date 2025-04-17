import { Stack } from 'expo-router';
import { AuthProvider } from '../components/AuthContext'; // ou où tu l’as mis

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Connexion' }} />
        <Stack.Screen name="register" options={{ title: 'Inscription' }} />
        <Stack.Screen name="explore" options={{ title: 'Explorer' }} />
      </Stack>
    </AuthProvider>
  );
}