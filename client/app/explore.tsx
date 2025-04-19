import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import WebMap from '../components/WebMap';
import ProtectedRoute from '../components/ProtectedRoute';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../components/AuthContext'; 
import { useNavigation } from '@react-navigation/native';

const ExploreScreen = () => {
  const { authStatus, setAuthStatus, userData } = useAuth();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(''); // filtre
  const [markers, setMarkers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (authStatus === 'checking') {
      console.log('Vérification de l\'état d\'authentification...');
    }
  }, [authStatus, userData]);

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
          <Button title="Profil" onPress={() => navigation.navigate('stats')} color="#007AFF"/>
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
            <Picker.Item label="Pas de filtres" value={""} />
            <Picker.Item label="1" value={"1"} />
            <Picker.Item label="2" value={"2"} />
            <Picker.Item label="3" value={"3"} />
            <Picker.Item label="4" value={"4"} />
            <Picker.Item label="5" value={"5"} />
          </Picker>
        </View>

        <View style={styles.container}>
          <WebMap selectedDifficulty={selectedDifficulty} setMarkers={setMarkers} />
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
    marginTop: -20,
    marginBottom: -20,
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 20,
    marginLeft: 10,
    marginTop: 0,
  },
  picker: {
    flex: 1,
    height: 80,
    marginLeft: 0,
    marginTop: 0,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent'
  },
});

export default ExploreScreen;
