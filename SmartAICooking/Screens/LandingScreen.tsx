import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingFood from '../components/FloatingFood';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Main: undefined;
  // add other routes here if needed
};

const { height, width } = Dimensions.get('window');

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Explore, Scan and Eat Healthy!</Text>
        <Text style={styles.subtitle}>Discover delicious & nutritious food</Text>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Your floating items – already good */}
      <FloatingFood emoji="🍿" top={height * 0.72} left={width * 0.08} />
      <FloatingFood emoji="🍛" top={height * 0.08} right={width * 0.10} />
      <FloatingFood emoji="🍎" top={height * 0.24} left={width * 0.12} />
      <FloatingFood emoji="🍔" top={height * 0.26} right={width * 0.01} />
      <FloatingFood emoji="🍕" top={height * 0.17} right={width * 0.4} />
      <FloatingFood emoji="🥑" top={height * 0.49} left={width * 0.09} />
      <FloatingFood emoji="🥟" top={height * 0.79} right={width * 0.10} />
      <FloatingFood emoji="🌮" top={height * 0.05} left={width * 0.10} />
      <FloatingFood emoji="🥚" top={height * 0.40} left={width * 0.40} />
      <FloatingFood emoji="🍟" top={height * 0.45} right={width * 0.08} />
      <FloatingFood emoji="☕" top={height * 0.70} right={width * 0.32} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#695a44',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 70,
    borderRadius: 30,
  },
  buttonText: {
    color: '#FDB813',
    fontSize: 18,
    fontWeight: 'bold',
  },
});