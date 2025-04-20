import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const StatsScreen = () => {
  const { userData, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const [ranking, setRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loadingRanking, setLoadingRanking] = useState<boolean>(true);
  const [errorRanking, setErrorRanking] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadAll = async () => {
        setLoading(true);
        await refreshUserData();
        await fetchRanking();
        setLoading(false);
      };
      loadAll();
    }, [])
  );

  const fetchRanking = async () => {
    try {
      if (!userData?._id) return;
      
      const res = await fetch('http://10.0.2.2:5001/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`Statut HTTP ${res.status}`);
      const users: Array<{ _id: string; points: number }> = await res.json();

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

  const formattedMean = (val: number | null | undefined) => {
    if (typeof val !== 'number' || isNaN(val)) return '0.00';
    return val.toFixed(2);
  };

  if (!userData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#293B3A" />
        <Text style={styles.message}>Chargement des données utilisateur...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#293B3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistiques</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profil</Text>
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color="#D97D54" />
            <Text style={styles.infoText}>{userData.pseudo}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#D97D54" />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="star" size={20} color="#D97D54" />
            <Text style={styles.infoText}>{userData.points || 0} points</Text>
          </View>
        </View>
      </View>

      {/* Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Activité</Text>
        
        <View style={styles.statItem}>
          <MaterialIcons name="flag" size={20} color="#4CAF50" />
          <Text style={styles.statText}>Caches trouvées: {userData.caches_found || 0}</Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialIcons name="add-location" size={20} color="#2e86ab" />
          <Text style={styles.statText}>Caches créées: {userData.caches_created || 0}</Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialIcons name="assessment" size={20} color="#9C27B0" />
          <Text style={styles.statText}>Moyenne difficulté: {formattedMean(userData.mean_difficulty)}</Text>
        </View>

        {loadingRanking ? (
          <View style={styles.statItem}>
            <ActivityIndicator size="small" color="#293B3A" />
            <Text style={styles.statText}>Chargement du classement...</Text>
          </View>
        ) : errorRanking ? (
          <View style={styles.statItem}>
            <MaterialIcons name="error" size={20} color="#F44336" />
            <Text style={[styles.statText, { color: '#F44336' }]}>{errorRanking}</Text>
          </View>
        ) : (
          <View style={styles.statItem}>
            <MaterialIcons name="leaderboard" size={20} color="#FFC107" />
            <Text style={styles.statText}>Classement: {ranking}/{totalUsers}</Text>
          </View>
        )}
      </View>
    
      
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#293B3A',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#293B3A',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  profileInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#444',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#444',
  },
});

export default StatsScreen;