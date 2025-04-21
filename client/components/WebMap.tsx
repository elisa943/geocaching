import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Modal, TextInput, Text, Button, Alert, TouchableOpacity} from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';

const difficultyColors = {
  1: '#D5C88F',  
  2: '#4D9E96',  
  3: '#D97D54',  
  4: '#C45C3D',  
  5: '#293B3A'   
};

const WebMap = ({ selectedDifficulty, setMarkers, onRef }) => {
    const [webViewLoaded, setWebViewLoaded] = useState(false);
    const [markers, setLocalMarkers] = useState([]);
    const webViewRef = useRef(null);
    const [newMarkerData, setNewMarkerData] = useState(null);
    const [selectedMarkerId, setSelectedMarkerId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingMarkerId, setEditingMarkerId] = useState(null);
    const [userLocation, setUserLocation] = useState(null); 

    const difficultyFilter = selectedDifficulty ? parseInt(selectedDifficulty) : 0;
    const filtered = difficultyFilter === 0
      ? markers
      : markers.filter(marker => marker.difficulty === difficultyFilter);

    const recenterMap = () => {
      if (userLocation && webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: 'recenter',
            coords: userLocation, // Envoie les coordonnées de l'utilisateur
          })
        );
      } else {
        console.error('Impossible de recentrer la carte : localisation utilisateur non disponible.');
      }
    };

    const addMarkerAtUserLocation = () => { // Fonction pour ajouter un marqueur à la position de l'utilisateur
      if (userLocation) {
        setNewMarkerData({
          lat: userLocation.lat,
          lng: userLocation.lng,
          difficulty: 1, // Valeur par défaut
          description: '', // Valeur par défaut
        });
        setShowModal(true); // Ouvre le modal
      } else {
        Alert.alert('Erreur', 'La localisation de l\'utilisateur n\'est pas disponible.');
      }
    };

    useEffect(() => { // transmet les méthodes recenterMap et addMarkerAtUserLocation au parent
      if (onRef) {
        onRef({ recenterMap, addMarkerAtUserLocation }); // Expose les méthodes
      }
    }, [onRef, recenterMap, addMarkerAtUserLocation]);

  const fetchCurrentUser = async () => {
    try {
      const pseudo = await AsyncStorage.getItem('pseudo');
      setCurrentUser(pseudo?.trim());
    } catch (error) {
      console.error('Error fetching pseudo:', error);
    }
  };

  const getMarkers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://10.0.2.2:5001/markers', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache' // Désactive le cache
        },
      });
      
      const data = await response.json();
      
      // Conversion explicite des IDs et vérification
      const formattedData = data.map(marker => ({
        ...marker,
        _id: marker._id.toString(), // Conversion ObjectId en string
        lat: marker.latitude,
        lng: marker.longitude
      }));
      
      setLocalMarkers(formattedData);
      setMarkers(formattedData);
  
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMarkerAction = async (action: 'delete' | 'found' | 'edit') => {
    
    if (!selectedMarkerId) return;
    console.log('action:', action);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const marker = markers.find(m => m._id === selectedMarkerId);
      
      if (action === 'delete') { 
        await fetch(`http://10.0.2.2:5001/markers/${selectedMarkerId}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
        });
        await getMarkers();
        setNewMarkerData(null); // Réinitialiser les données du marqueur
      }

      else if (action === 'found') {
        Alert.alert('Bravo !', 'Vous avez trouvé la cache !');
        const finderPseudo = await AsyncStorage.getItem('pseudo');
        console.log('Pseudo du trouveur:', finderPseudo);
        const response = await fetch(
          `http://10.0.2.2:5001/markers/found/${selectedMarkerId}`,
          {
            method: 'DELETE',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ finderPseudo })
          }
        );
      
        const data = await response.json();    
        if (response.ok) {
          await getMarkers(); // mettre à jour l’UI, retirer le marker, recharger les markers…
        } else {
          console.error('API Error:', data.message);
          throw new Error(`Erreur HTTP ${response.status}: ${data.message}`);
        }

        setNewMarkerData(null); // Réinitialiser les données du marqueur
      }
      
  
      else if (action === 'edit') {
        // Pré-remplir le formulaire avec les données existantes
        setNewMarkerData({
          lat: marker.lat,
          lng: marker.lng,
          difficulty: marker.difficulty,
          description: marker.description,
        });
        setEditingMarkerId(selectedMarkerId);
        setShowModal(true);
      }
  
      setSelectedMarkerId(null);
      await getMarkers();
  
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleFormSubmit = async () => {
    if (!newMarkerData) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const pseudo = await AsyncStorage.getItem('pseudo');

      const url = editingMarkerId 
        ? `http://10.0.2.2:5001/markers/${editingMarkerId}`
        : 'http://10.0.2.2:5001/markers';

      const method = editingMarkerId ? 'PUT' : 'POST';    

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: newMarkerData.lat,
          longitude: newMarkerData.lng,
          difficulty: newMarkerData.difficulty,
          description: newMarkerData.description,
          creator: pseudo || 'Inconnu'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      await getMarkers();
      setShowModal(false);
      setNewMarkerData(null);
      setEditingMarkerId(null);

    } catch (error) {
      console.error('Erreur lors de la soumission:', error.message);
      Alert.alert('Erreur', error.message);
    }
  };

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    if (data.type === 'click') {
      const { lat, lng } = data.coords;
      setNewMarkerData({ lat, lng, difficulty: 1, description: '' });
      setShowModal(true);
    }
    
    if (data.type === 'markerClick') {
      setSelectedMarkerId(data.markerId);
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Demander la permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission de localisation refusée');
          return;
        }

        // Récupérer la position
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
      } catch (error) {
        console.error('Erreur de localisation:', error);
      }
    };

    getLocation();
    getMarkers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (webViewLoaded && webViewRef.current) {
      const toSend = {
        type: 'addMarkers',
        markers: filtered,
        userLocation: userLocation
      };
      webViewRef.current.postMessage(JSON.stringify(toSend));
    }
  }, [filtered, webViewLoaded, userLocation]);

  const selectedMarker = markers.find(m => m._id === selectedMarkerId || m.id === selectedMarkerId);
  const isCreator = selectedMarker?.creator === currentUser;

  return (
    <View style={styles.container}>

      <WebView
        ref={webViewRef}
        onMessage={handleMessage}
        onLoadEnd={() => setWebViewLoaded(true)}
        source={{ html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          </head>
          <style>
              .custom-icon {
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                position: relative;
                background: {color};
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .custom-icon::after {
                content: "{difficulty}";
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: 12px;
                text-shadow: 0 0 2px rgba(0,0,0,0.5);
              }
              .leaflet-popup-content {
                font-family: Arial, sans-serif;
                min-width: 200px;
              }
              .leaflet-popup-content-wrapper {
                border-radius: 8px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
              }
              .leaflet-popup-tip {
                background: rgba(255, 255, 255, 1);
              }
          </style>
          
          <body style="margin:0;padding:0;height:100%;">
            <div id="map" style="height: 100vh;"></div>
            <script>
              let defaultPosition = [45.4371908, 12.3345898]; // Venise
              const map = L.map('map').setView(defaultPosition, 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
              const markersLayer = L.layerGroup().addTo(map);

              const difficultyColors = {
                1: '#D5C88F',  
                2: '#4D9E96',  
                3: '#D97D54',  
                4: '#C45C3D',  
                5: '#293B3A'   
              };

              document.addEventListener('message', (event) => {
                const message = JSON.parse(event.data);

                if (message.type === 'recenter') {
                  const { lat, lng } = message.coords;
                  map.setView([lat, lng], 13); // Recentre la carte sur les coordonnées fournies
                }
              });

              document.addEventListener('message', (event) => { // Écoute des messages du WebView
                const message = JSON.parse(event.data);

                if (message.type === 'recenter') {
                  map.setView([message.coords.lat, message.coords.lng], 13);
                }
                if (message.type === 'addMarkers') {

                  // Si on a une position utilisateur, centrer la carte dessus
                  if (message.userLocation) {
                    map.setView([message.userLocation.lat, message.userLocation.lng], 13);
                    
                    // Optionnel: Ajouter un marqueur pour la position de l'utilisateur
                    L.marker([message.userLocation.lat, message.userLocation.lng], {
                      icon: L.divIcon({
                        html: '<div style="background:#4285F4;color:black;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;margin-top:-15px;margin-left:-15px;">👤</div>'
                      })
                    }).addTo(map).bindPopup('Votre position');
                  }

                  // Ajout des marqueurs
                  markersLayer.clearLayers();
                  message.markers.forEach(m => {
                    const iconHtml = \`<div style="
                      background: \${difficultyColors[m.difficulty]};
                      color: white;
                      width: 30px;
                      height: 30px;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: 14px;
                      margin-top: -5px;
                      margin-left: -5px;
                      "
                    >\${m.difficulty}</div>\`;

                    const marker = L.marker([m.lat, m.lng], {
                      icon: L.divIcon({ html: iconHtml })
                    }).addTo(markersLayer);

                    marker.bindPopup(
                      \`<div style="padding:6px">
                        <div style="display:flex;align-items:center;margin-bottom:8px">
                          <div style="width:16px;height:16px;border-radius:50%;background:\${difficultyColors[m.difficulty]};margin-right:8px"></div>
                          <span style="font-weight:bold">Difficulté: \${m.difficulty}/5</span>
                        </div>
                        <div style="margin-bottom:8px">
                          <span style="color:#666">Crée par </span>
                          <span style="font-weight:bold">\${m.creator}</span>
                        </div>
                        <div style="padding:8px;background:#f5f7fa;border-radius:6px">
                          \${m.description || '<i>Aucune description</i>'}
                        </div>
                      </div>\`
                    );
                    
                    marker.on('popupopen', () => {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerClick',
                        markerId: m._id || m.id
                      }));
                    });
                  });
                }
              });

              map.on('click', function(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'click',
                  coords: { lat: e.latlng.lat, lng: e.latlng.lng }
                }));
              });
            </script>
          </body>
          </html>
        `}}
      />

      <Modal visible={showModal} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMarkerId ? 'Modifier la cache' : 'Nouvelle cache'}
            </Text>
            
            <Text style={styles.label}>Difficulté</Text>

            <Slider
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={newMarkerData?.difficulty}
              minimumTrackTintColor={difficultyColors[newMarkerData?.difficulty]}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor={difficultyColors[newMarkerData?.difficulty || 1]}
              onValueChange={(value) => setNewMarkerData(prev => ({ ...prev, difficulty: value }))}
            />

            <View style={styles.difficultyBadges}>
              {[1, 2, 3, 4, 5].map(num => (
              <View 
                key={num} 
                style={[
                  styles.difficultyBadge,
                  { 
                    backgroundColor: difficultyColors[num],
                    opacity: num === (newMarkerData?.difficulty || 1) ? 1 : 0.3
                  }
                ]}
              >
                <Text style={styles.difficultyText}>{num}</Text>
              </View>
            ))}
          </View>

            {/* Section Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                placeholder="Décrivez votre cache..."
                placeholderTextColor="#999"
                value={newMarkerData?.description || ''}
                onChangeText={(text) => setNewMarkerData(prev => ({ ...prev, description: text }))}
                style={styles.input}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button title="Annuler" onPress={() => setShowModal(false)} color="#D97D54" />
              <Button title={editingMarkerId ? "Modifier" : "Ajouter"} onPress={handleFormSubmit} color="#293B3A"/>
            </View>
          </View>
        </View>
      </Modal>

      {selectedMarkerId && currentUser && (
      <View style={[
        styles.markerActions,
        !isCreator && styles.singleAction
      ]}>
        {isCreator ? (
          <>
            <Button title="Modifier" onPress={() => handleMarkerAction('edit')} style={{ marginRight: 10 }} color="#2e86ab" />
            <Button title="Supprimer" color="red" onPress={() => handleMarkerAction('delete')} color="#F44336" />
          </>
        ) : (
          <Button 
            title="Trouvé !" 
            color="green" 
            onPress={() => handleMarkerAction('found')}
            buttonStyle={styles.foundButton} 
          />
        )}
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  difficultyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  markerActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0)', // background transparent
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  singleAction: {
    justifyContent: 'center',
  },
  foundButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'green', 
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#293B3A',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  difficultyBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
  },
  difficultyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  difficultyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  difficultyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default WebMap;