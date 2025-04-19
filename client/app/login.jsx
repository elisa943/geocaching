import { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../components/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { authStatus, setAuthStatus } = useAuth();


  const navigation = useNavigation();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigation.replace('explore'); // Redirection vers l'écran "explore"
    }
  }, [authStatus, navigation]); // Assurez-vous que navigation est dans les dépendances


  const handleLogin = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token);
        if (data.pseudo) {
          await AsyncStorage.setItem('pseudo', data.pseudo);
        }

  
        await setAuthStatus('authenticated');  
  
        navigation.replace('explore');
      } else {
        Alert.alert('Identifiants invalides', data.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      Alert.alert(error.message);
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
});
