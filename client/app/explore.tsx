import React from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import WebMap from '../components/WebMap';
import { useRouter } from 'expo-router';
import { useRootNavigationState } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../components/AuthContext'; 
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

const ExploreScreen = () => {
  const { authStatus, setAuthStatus, userData, fetchUserData } = useAuth();
  const router = useRouter();
  const rootNavigation = useRootNavigationState();

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(''); // valeur par défaut = "Toutes les difficultés"

  useEffect(() => {
      if (!rootNavigation?.key) return;

      if (authStatus === 'unauthenticated') {
          router.replace('/');
      } else if (authStatus === 'authenticated' && !userData) {
          // Si authentifié mais pas de données utilisateur, les récupérer
          fetchUserData();
      }
  }, [authStatus, rootNavigation, userData]);
  
  const handleLogout = async () => {
      try {
          await AsyncStorage.removeItem('userToken');
          setAuthStatus('unauthenticated');
          showAlert('Déconnexion réussie');
      } catch (error) {
          console.error('Erreur lors de la déconnexion', error);
      }
  };

  const showAlert = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(message);
    }
  };  

  return (
      <ProtectedRoute>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              Bienvenue {userData?.pseudo}
            </Text>
            <Button title="Déconnexion" onPress={handleLogout} color="#FF3B30" />
          </View>

          {/* Ajout du filtre de difficulté */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filtrer par difficulté :</Text>
            <Picker
              selectedValue={selectedDifficulty}
              onValueChange={(itemValue) => setSelectedDifficulty(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Toutes les difficultés" value={""} />
              <Picker.Item label="1" value={"1"} />
              <Picker.Item label="2" value={"2"} />
              <Picker.Item label="3" value={"3"} />
              <Picker.Item label="4" value={"4"} />
              <Picker.Item label="5" value={"5"} />
            </Picker>
          </View>
    
          <View style={styles.container}>
            <WebMap selectedDifficulty={selectedDifficulty} /> {/* Passe la difficulté sélectionnée à WebMap */}
          </View>
        </View>
      </ProtectedRoute>
    );      
};

const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      paddingTop: 20,
      paddingHorizontal: 10,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    welcomeText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    filterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginTop: -50,
      marginLeft: 200,
      marginRight: 300,
    },
    filterLabel: {
      fontSize: 16,
      marginRight: 20,
      marginLeft: 200,
    },
    picker: {
      flex: 1,
      height: 40,
      marginLeft: 20,
    },
    container: {
      flex: 1,
    },
  });
  

export default ExploreScreen;