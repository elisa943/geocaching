import { View, Text, StyleSheet, Image, Linking } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GeoCache Explorer</Text>
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"></Image>
      <Text style={styles.subtitle}>
        La chasse au trésor moderne pour aventuriers numériques
      </Text>

      <View style={styles.descriptionBox}>
        <Text style={styles.description}>
          GeoCache Explorer est une application mobile de géocaching traditionnel.
          Cachez et découvrez des trésors dans votre environnement, partagez vos aventures et
          défiez vos amis dans cette chasse au trésor 2.0.
        </Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <FontAwesome name="map-marker" size={20} color="#2e86ab" />
            <Text style={styles.featureText}>Découvrez des caches près de chez vous</Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome name="lock" size={20} color="#2e86ab" />
            <Text style={styles.featureText}>Système d'authentification sécurisé</Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome name="trophy" size={20} color="#2e86ab" />
            <Text style={styles.featureText}>Classements et défis</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <Link href="/login" style={styles.button}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Link>
        <Link href="/register" style={[styles.button, styles.secondaryButton]}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>S'inscrire</Text>
        </Link>
      </View>

      <Text 
        style={styles.learnMore}
        onPress={() => Linking.openURL('https://fr.wikipedia.org/wiki/G%C3%A9ocaching')}
      >
        En savoir plus sur le géocaching
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e86ab',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  descriptionBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  features: {
    marginTop: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2e86ab',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2e86ab',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2e86ab',
  },
  learnMore: {
    color: '#2e86ab',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});