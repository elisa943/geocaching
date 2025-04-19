import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Modal, TextInput, Text, Button, Alert } from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

const difficultyColors = {
  1: 'green',
  2: '#f3d125',
  3: 'orange',
  4: 'red',
  5: 'purple',
};

const WebMap = ({ selectedDifficulty, setMarkers }) => {
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [markers, setLocalMarkers] = useState([]);
  const webViewRef = useRef(null);
  const [newMarkerData, setNewMarkerData] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingMarkerId, setEditingMarkerId] = useState(null);

  const difficultyFilter = selectedDifficulty ? parseInt(selectedDifficulty) : 0;
  const filtered = difficultyFilter === 0
    ? markers
    : markers.filter(marker => marker.difficulty === difficultyFilter);

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
      }

      if (action === 'found') 
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
          console.log('[Cache trouvé], nouvelles stats :', data.user);
          
          await getMarkers(); // mettre à jour l’UI, retirer le marker, recharger les markers…
        } else {
          console.error('API Error:', data.message);
          throw new Error(`Erreur HTTP ${response.status}: ${data.message}`);
        }
      
      
  
      if (action === 'edit') {
        // Pré-remplir le formulaire avec les données existantes
        setNewMarkerData({
          lat: marker.lat,
          lng: marker.lng,
          difficulty: marker.difficulty,
          description: marker.description
        });
        setEditingMarkerId(selectedMarkerId);
        setShowModal(true);
      }
  
      setSelectedMarkerId(null);
      setNewMarkerData(null); // Réinitialiser les données du marqueur
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
    getMarkers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (webViewLoaded && webViewRef.current) {
      const toSend = {
        type: 'addMarkers',
        markers: filtered,
      };
      webViewRef.current.postMessage(JSON.stringify(toSend));
    }
  }, [filtered, webViewLoaded]);

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
          <body style="margin:0;padding:0;height:100%;">
            <div id="map" style="height: 100vh;"></div>
            <script>
              const map = L.map('map').setView([48.8566, 2.3522], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
              const markersLayer = L.layerGroup().addTo(map);

              const difficultyColors = {
                1: 'green',
                2: '#f3d125',
                3: 'orange',
                4: 'red',
                5: 'purple'
              };

              document.addEventListener('message', (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'addMarkers') {
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
                      font-size: 14px;"
                    >\${m.difficulty}</div>\`;

                    const marker = L.marker([m.lat, m.lng], {
                      icon: L.divIcon({ html: iconHtml })
                    }).addTo(markersLayer);

                    marker.bindPopup(\`<b>Difficulté:</b> \${m.difficulty}<br/>
                                      <b>Créateur:</b> \${m.creator}<br/>
                                      <i>\${m.description}</i>\`);
                    marker.on('popupopen', () => {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerClick',
                        markerId: m._id || m.id // Envoyez les deux formats d'ID
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
            <Text style={styles.label}>Difficulté</Text>
            <Slider
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={newMarkerData?.difficulty || 1}
              minimumTrackTintColor={difficultyColors[newMarkerData?.difficulty || 1]}
              maximumTrackTintColor="#ccc"
              thumbTintColor={difficultyColors[newMarkerData?.difficulty || 1]}
              onValueChange={(value) => setNewMarkerData(prev => ({ ...prev, difficulty: value }))}
            />
            <View style={styles.difficultyLabels}>
              {[1, 2, 3, 4, 5].map(num => (
                <Text key={num} style={{ 
                  color: difficultyColors[num],
                  width: 30,
                  textAlign: 'center'
                }}>{num}</Text>
              ))}
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={newMarkerData?.description || ''}
              onChangeText={(text) => setNewMarkerData(prev => ({ ...prev, description: text }))}
              style={styles.input}
              multiline
            />

            <View style={styles.buttonRow}>
              <Button title="Annuler" onPress={() => setShowModal(false)} />
              <Button title={editingMarkerId ? "Modifier" : "Ajouter"} onPress={handleFormSubmit} />
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
            <Button title="Modifier" onPress={() => handleMarkerAction('edit')} style={{ marginRight: 10 }} />
            <Button title="Supprimer" color="red" onPress={() => handleMarkerAction('delete')} />
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
    backgroundColor: 'white',
    elevation: 5, 
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

});

export default WebMap;