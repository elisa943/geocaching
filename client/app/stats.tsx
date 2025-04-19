import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const StatsScreen = () => {
  const { userData, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const [ranking, setRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loadingRanking, setLoadingRanking] = useState<boolean>(true);
  const [errorRanking, setErrorRanking] = useState<string | null>(null);
  

  // Quand l'écran est focus, on rafraîchit userData puiѕ on charge le classement
  useFocusEffect(
    React.useCallback(() => {
      const loadAll = async () => {
        setLoading(true);
        await refreshUserData();
        await fetchRanking();  // ta fonction existante
        setLoading(false);
      };
      loadAll();
    }, [])
  );


  useEffect(() => {
    if (!userData?._id) return;

    const fetchRanking = async () => {
      try {
        // Récupère tous les users (sans tri côté API)
        const res = await fetch('http://10.0.2.2:5001/api/users', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error(`Statut HTTP ${res.status}`);
        const users: Array<{ _id: string; points: number }> = await res.json();

        // Trie décroissant par points
        users.sort((a, b) => b.points - a.points);

        setTotalUsers(users.length);
        const index = users.findIndex(u => u._id === userData._id);
        setRanking(index >= 0 ? index + 1 : null);
      } catch (err: any) {
        console.error(err);
        setErrorRanking('Impossible de charger le classement');
      } finally {
        setLoadingRanking(false);
      }
    };

    fetchRanking();
  }, [userData]);

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Chargement des données utilisateur...</Text>
      </View>
    );
  }
  const formattedMean = (val: number | null | undefined) => {
    if (typeof val !== 'number' || isNaN(val)) {
      return '0.00'; // Valeur par défaut si val n'est pas un nombre
    }
    return val.toFixed(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Button title="← Retour" onPress={() => navigation.goBack()} color="#007AFF" />
      </View>

      <Text style={styles.title}>Profil de {userData.pseudo}</Text>
      <View style={styles.profileSection}>
        <Text style={styles.profileItem}>Pseudo : {userData.pseudo}</Text>
        <Text style={styles.profileItem}>Email : {userData.email}</Text>
        <Text style={styles.profileItem}>Points : {userData.points ? userData.points : 0}</Text>
      </View>

      <Text style={styles.subtitle}>Statistiques</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.statItem}>
          Caches trouvées : {userData.caches_found ? userData.caches_found : 0}
        </Text>
        <Text style={styles.statItem}>
          Caches créées : {userData.caches_created ? userData.caches_created : 0}
        </Text>
        <Text style={styles.statItem}>
          Moyenne difficulté : {formattedMean(userData.mean_difficulty)}
        </Text>

        {loadingRanking ? (
          <View style={styles.rankRow}>
            <ActivityIndicator />
            <Text style={styles.statItem}>Chargement du classement…</Text>
          </View>
        ) : errorRanking ? (
          <Text style={[styles.statItem, { color: 'red' }]}>{errorRanking}</Text>
        ) : (
          <Text style={styles.statItem}>
            Classement : {ranking}/{totalUsers}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  topBar: { alignSelf: 'flex-start', marginBottom: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { fontSize: 20, fontWeight: '600', marginTop: 30, marginBottom: 10 },
  profileSection: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  profileItem: { fontSize: 16, marginBottom: 6 },
  statsContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 2,
  },
  statItem: { fontSize: 16, marginBottom: 8 },
  rankRow: { flexDirection: 'row', alignItems: 'center' },
  message: { fontSize: 18, color: '#888' },
});

export default StatsScreen;
