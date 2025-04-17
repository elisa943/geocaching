// Création d'un contexte global pour l'authentification. 
// Ce contexte permet de centraliser l'état d'authentification de l'utilisateur.
// Deux propriétés sont définies : authStatus et setAuthStatus.

// authStatus peut prendre 3 valeurs : 'checking', 'authenticated' ou 'unauthenticated'.
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Assurez-vous d'avoir axios installé

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

// Ajout d'un type pour les données utilisateur
interface UserData {
  _id: string;
  pseudo: string;
  email: string;
}

// L'interface AuthContextType définit la structure du contexte d'authentification.
// Elle contient l'état d'authentification (authStatus) et une fonction pour le modifier (setAuthStatus).

interface AuthContextType {
  authStatus: AuthStatus;
  setAuthStatus: (status: AuthStatus) => void;
  userData: UserData | null; // Ajout des données utilisateur
  fetchUserData: () => Promise<void>; // Fonction pour récupérer les données
}

const AuthContext = createContext<AuthContextType>({
  authStatus: 'unauthenticated',
  setAuthStatus: () => {},
  userData: null,
  fetchUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authStatus, setAuthStatusState] = useState<AuthStatus>('checking');
    const [userData, setUserData] = useState<UserData | null>(null);

    // Fonction pour récupérer les données utilisateur depuis l'API
    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setUserData(null);
                return;
            }

            const response = await axios.get('http://10.188.133.109:5001/api/auth/me', {
                headers: {
                  Authorization: `Bearer ${token}`
                }
            });

          if (response.data.success) {
              setUserData(response.data.data);
          }
        } catch (error) {
              console.error('Erreur lors de la récupération des données utilisateur:', error);
              // En cas d'erreur comme un token expiré, on déconnecte l'utilisateur
              setAuthStatus('unauthenticated');
        }
    };

  const setAuthStatus = async (status: AuthStatus) => {
      setAuthStatusState(status);
      if (status === 'unauthenticated') {
          await AsyncStorage.removeItem('userToken');
          setUserData(null); // Vider les données utilisateur à la déconnexion
      } else if (status === 'authenticated') {
          // Récupérer les données utilisateur quand l'authentification est validée
          await fetchUserData();
      }
  };

  useEffect(() => {
      const checkAuthStatus = async () => {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
              setAuthStatusState('authenticated');
              // Récupérer les données utilisateur au chargement si un token existe
              await fetchUserData();
          } else {
              setAuthStatusState('unauthenticated');
          }
      };
      setAuthStatus('checking'); // Initialiser l'état à 'checking' avant de vérifier le token
      checkAuthStatus();
  }, []);

  return (
      <AuthContext.Provider value={{ authStatus, setAuthStatus, userData, fetchUserData }}>
          {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};