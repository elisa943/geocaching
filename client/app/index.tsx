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
            <FontAwesome name="map-marker" size={20} color="#293B3A" />
            <Text style={styles.featureText}>Découvrez des caches près de chez vous</Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome name="lock" size={20} color="#293B3A" />
            <Text style={styles.featureText}>Système d'authentification sécurisé</Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome name="trophy" size={20} color="#293B3A" />
            <Text style={styles.featureText}>Système de points et classements</Text>
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
    backgroundColor: 'rgb(226, 219, 199)',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
    shadowColor: 'rgba(41, 59, 58, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgb(41, 59, 58)',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgb(101, 101, 101)',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  descriptionBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 30,
    shadowColor: 'rgba(41, 59, 58, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgb(79, 79, 79)',
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    textAlign: 'center',
  },
  features: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 15,
    color: 'rgb(41, 59, 58)',
    flexShrink: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  button: {
    backgroundColor: 'rgb(41, 59, 58)',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 14,
    flex: 1,
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgb(41, 59, 58)',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: 'rgb(41, 59, 58)',
  },
  learnMore: {
    color: '#D97D54',
    fontWeight: '500',
    textDecorationLine: 'underline',
    marginTop: 10,
    fontSize: 15,
  },
});