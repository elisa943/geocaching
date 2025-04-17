import { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../components/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { authStatus, setAuthStatus } = useAuth();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/explore'); // l'user est redirigé s'il est déjà connecté
    }
  }, [authStatus]);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://10.188.133.109:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token);
        
        if (data.pseudo) {
          await AsyncStorage.setItem('pseudo', data.pseudo);
        } else {
          // Vérifiez si le pseudo existe peut-être dans un sous-objet
          console.warn('Structure de la réponse:', JSON.stringify(data));
        }
  
        await setAuthStatus('authenticated');
        router.push('/explore');
      } else {
        window.alert(data.message || 'Erreur de connexion');
      }
  
    } catch (error) {
      console.error('Erreur complète:', error);
      window.alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Se connecter" onPress={handleLogin} />
      <Link href="/register" style={styles.link}>
        Créer un compte
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 100,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  link: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
  },
});
