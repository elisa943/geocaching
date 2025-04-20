import WebMap from '../components/WebMap';
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../components/AuthContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import ProtectedRoute from '../components/ProtectedRoute';

const ExploreScreen = () => {
  const { authStatus, setAuthStatus, userData } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [markers, setMarkers] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const navigation = useNavigation();
  const webMapRef = useRef(null);

  const handleRecenter = () => {
    if (webMapRef.current) {
      webMapRef.current.recenterMap();
    }
  };


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
    Alert.alert(message);
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Header moderne */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <MaterialIcons name="account-circle" size={32} color="#293B3A" />
            <Text style={styles.welcomeText}>{userData?.pseudo}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('stats')}
            >
              <FontAwesome name="bar-chart" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Carte */}
        <View style={styles.mapContainer}>
          <WebMap selectedDifficulty={selectedDifficulty} setMarkers={setMarkers}/>
        </View>

        {/* Filtre FAB */}
        <TouchableOpacity 
          style={[styles.fab, styles.filterFab]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>

        {/* Ajoute un cache sur la localisation de l'user*/}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('addCache')}
        >
          <MaterialIcons name="add-location-alt" size={28} color="white" />
        </TouchableOpacity>

        {/* Modal de filtre */}
        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrer par difficulté</Text>
              
              <Picker
                selectedValue={selectedDifficulty}
                onValueChange={(value) => {
                  setSelectedDifficulty(value);
                  setShowFilterModal(false);
                }}
                style={styles.modalPicker}
              >
                <Picker.Item label="Toutes difficultés" value="" />
                <Picker.Item label="⭐ Facile" value="1" />
                <Picker.Item label="⭐⭐ Intermédiaire" value="2" />
                <Picker.Item label="⭐⭐⭐ Moyen" value="3" />
                <Picker.Item label="⭐⭐⭐⭐ Difficile" value="4" />
                <Picker.Item label="⭐⭐⭐⭐⭐ Expert" value="5" />
              </Picker>

              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalCloseText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ProtectedRoute>
  );      
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#293B3A',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#293B3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#D97D54',
  },
  mapContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#293B3A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  filterFab: {
    bottom: 90,
    backgroundColor: '#D97D54',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#293B3A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalPicker: {
    width: '100%',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#293B3A',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ExploreScreen;