import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const WebMap = ({ selectedDifficulty }) => {
    if (selectedDifficulty === null) {
        selectedDifficulty = "0"
    } 
    selectedDifficulty = Number(selectedDifficulty);
    console.log("selectedDifficulty: ", selectedDifficulty);
    
    const [markers, setMarkers] = useState<{ id: string; lat: number; lng: number; creator: string; difficulty: number; description?: string }[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newMarkerData, setNewMarkerData] = useState<{ lat: number; lng: number; difficulty: number; description: string | undefined } | null>(null);

    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);

    const [currentUser, setCurrentUser] = useState<string | null>(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const pseudo = await AsyncStorage.getItem('pseudo');
            setCurrentUser(pseudo);
        };
    
        fetchCurrentUser();
    }, []);

    const fetchMarkers = async () => {
        try {
            const response = await fetch('http://10.188.133.109:5001/markers', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const rawData = await response.json();
            const converted = rawData.map((m: any) => ({
                id: m.id,
                lat: m.latitude,
                lng: m.longitude,
                creator: m.userId,
                difficulty: Number(m.difficulty ?? 1),
                description: m.description ?? ''
            }));
            
            //setMarkers(converted); // Mettre à jour l'état avec les marqueurs convertis
            //console.log('Marqueurs récupérés :', converted);
            const filtered = converted.filter(marker => 
                selectedDifficulty === 0 || marker.difficulty === selectedDifficulty
            );
            setMarkers(filtered);
            

        } catch (error) {
            console.error('Erreur lors de la récupération des marqueurs :', error);
        }
    };

    useEffect(() => {
        if (!mapRef.current) {
            const L = require('leaflet');

            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            mapRef.current = L.map('map').setView([44.8378, -0.5792], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

            mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                setNewMarkerData({ lat, lng, difficulty: 1, description: '' });
                setShowForm(true);
            });
        }

        // Appel de fetchMarkers juste après l'initialisation de la carte
        fetchMarkers();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        fetchMarkers();
    }, [selectedDifficulty]);
    

    useEffect(() => {
        if (!mapRef.current) return;

        const L = require('leaflet');
        
        // Suppression des marqueurs existants 
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        const difficultyColors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
        // TODO : à modifier ? 
        markers.forEach(({ id, lat, lng, creator, difficulty, description }) => {
            if (selectedDifficulty === 0 || selectedDifficulty === difficulty) {
                // Création d'une icône personnalisée avec une couleur différente selon la difficulté
                const markerColor = difficultyColors[Math.min(5, Math.max(1, difficulty)) - 1];
                
                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div style="
                            background: ${markerColor};
                            width: 2rem;
                            height: 2rem;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: relative;
                            border-radius: 50% 50% 50% 0;
                            transform: rotate(-45deg);
                            box-shadow: -1px 1px 4px rgba(0,0,0,0.3);
                        ">
                            <div style="
                                transform: rotate(45deg);
                                color: white;
                                font-weight: bold;
                                font-size: 0.8rem;
                                text-align: center;
                                width: 100%;
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%) rotate(45deg);
                            ">
                                ${difficulty}
                            </div>
                        </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 24]
                });

                const marker = L.marker([lat, lng], { icon: customIcon })
                    .addTo(mapRef.current!)
                    .bindPopup(
                        `
                        <div style="
                            font-family: 'Segoe UI', Roboto, sans-serif;
                            padding: 0.5rem;
                            min-width: 200px;
                            border-radius: 4px;
                        ">
                            <div style="
                                background: #4a6fa5;
                                color: white;
                                padding: 0.5rem;
                                margin: -0.5rem -0.5rem 0.5rem -0.5rem;
                                font-weight: 500;
                                border-radius: 4px 4px 0 0;
                                font-size: 0.9rem;
                            ">
                                Cache
                            </div>
                            <p><strong>Créateur :</strong> ${creator}</p>
                            <p><strong>Difficulté :</strong> ${difficulty}</p>
                            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
                            
                            ${creator === currentUser ? `
                            <button style="
                                background: #4a6fa5;
                                border: none;
                                color: white;
                                padding: 0.5rem;
                                border-radius: 4px;
                                cursor: pointer;
                                margin-top: 0.5rem;
                                width: 100%;
                                font-size: 0.8rem;
                                transition: opacity 0.2s;
                            " id="edit-${id}">
                                Modifier
                            </button>
                            ` : `
                            <button style="
                                background:rgb(19, 157, 12);
                                border: none;
                                color: white;
                                padding: 0.5rem;
                                border-radius: 4px;
                                cursor: pointer;
                                margin-top: 0.5rem;
                                width: 100%;
                                font-size: 0.8rem;
                                transition: opacity 0.2s;
                            " id="found-${id}">
                                Trouvé !
                            </button>
                            `}
                        </div>
                        `,
                        { className: 'modern-popup' }
                    )
                    .on('popupopen', () => {
                        setTimeout(() => {
                            const btn = document.getElementById(`edit-${id}`);
                            if (btn) {
                                btn.onclick = () => {
                                    setNewMarkerData({ lat, lng, difficulty, description });
                                    setEditingMarkerId(id);
                                    setShowForm(true);
                                    mapRef.current?.closePopup();
                                };
                            }
                    
                            const foundBtn = document.getElementById(`found-${id}`);
                            if (foundBtn) {
                                foundBtn.onclick = async () => {
                                    await fetch(`http://10.188.133.109:5001/markers/${id}`, {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json' },
                                    });
                                    setMarkers(prev => prev.filter(m => m.id !== id));
                                    mapRef.current?.removeLayer(marker);
                                    mapRef.current?.closePopup();
                                };
                            }
                        }, 0);
                    });
            
                markersRef.current.push(marker);
            }
        });
        
    }, [markers]);

    const handleFormSubmit = async () => {
        if (newMarkerData) {
            try {
                const pseudo = await AsyncStorage.getItem('pseudo');
    
                const newMarker = {
                    id: editingMarkerId || `${Date.now()}`,
                    lat: newMarkerData.lat,
                    lng: newMarkerData.lng,
                    creator: pseudo || 'Inconnu',
                    difficulty: newMarkerData.difficulty,
                    description: newMarkerData.description,
                };
                

                
                if (editingMarkerId) { // 
                    setMarkers(prev => prev.map(m => m.id === editingMarkerId ? newMarker : m));
                    setEditingMarkerId(null);

                    await fetch(`http://10.188.133.109:5001/markers/${editingMarkerId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            latitude: newMarker.lat,
                            longitude: newMarker.lng,
                            difficulty: newMarker.difficulty,
                            description: newMarker.description,
                            type: 'standard',
                            userId: newMarker.creator
                        })
                    });
                } else {
                    await fetch('http://10.188.133.109:5001/markers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: newMarker.id,
                            latitude: newMarker.lat,
                            longitude: newMarker.lng,
                            difficulty: Number(newMarker.difficulty),
                            description: newMarker.description,
                            type: 'standard',
                            userId: newMarker.creator,
                            creator: pseudo || 'Inconnu'
                        })
                    });
                    setMarkers(prev => [...prev, newMarker]);
                }
                
                setShowForm(false);
                setNewMarkerData(null);
                await fetchMarkers();
            } catch (error) {
                console.error('Erreur lors de la récupération du pseudo :', error);
            }
        }
    };

    return (
        <>
            <div id="map" style={{ height: '100vh', width: '100%' }} />
            {showForm && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    fontFamily: "'Segoe UI', Roboto, sans-serif",
                    width: '320px',
                    maxWidth: '90vw',
                    border: '1px solid #e0e0e0'
                }}>
                    <h3 style={{
                        marginTop: '0',
                        color: '#333',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginBottom: '1.25rem',
                        fontSize: '1.1rem'
                    }}>
                        {editingMarkerId ? 'Modifier le cache' : 'Ajouter un cache'}
                    </h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#666',
                            fontWeight: '500'
                        }}>
                            Difficulté (1-5)
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={newMarkerData?.difficulty || 1}
                            onChange={(e) => setNewMarkerData(prev => prev ? { ...prev, difficulty: parseInt(e.target.value, 10) } : null)}
                            style={{
                                width: '100%',
                                height: '8px',
                                borderRadius: '4px',
                                background: 'linear-gradient(90deg, #4CAF50, #F44336)',
                                outline: 'none',
                                appearance: 'none'
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '0.5rem',
                            color: '#666',
                            fontSize: '0.8rem'
                        }}>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#666',
                            fontWeight: '500'
                        }}>
                            Description
                        </label>
                        <textarea
                            value={newMarkerData?.description || ''}
                            onChange={(e) => setNewMarkerData(prev => prev ? { ...prev, description: e.target.value } : null)}
                            style={{
                                width: '90%',
                                padding: '0.9rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                minHeight: '80px',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                fontSize: '0.9rem'
                            }}
                            placeholder=""
                        />
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginTop: '1rem'
                    }}>
                        <button 
                            onClick={() => setShowForm(false)}
                            style={{
                                flex: 1,
                                padding: '0.6rem',
                                backgroundColor: '#f5f5f5',
                                color: '#555',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem'
                            }}
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleFormSubmit}
                            style={{
                                flex: 1,
                                padding: '0.6rem',
                                backgroundColor: '#4a6fa5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem'
                            }}
                        >
                            {editingMarkerId ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default WebMap;