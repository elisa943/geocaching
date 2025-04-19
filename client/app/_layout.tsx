// app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../components/AuthContext'; 

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
