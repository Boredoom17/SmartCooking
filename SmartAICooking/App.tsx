/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LoginScreen from './Screens/Login';
import Header from './components/Header';
import ContactForm from './Screens/ContactUsPage';
import ContactConfirmation from './Screens/ContactUsConfirmationPage';
import WavyHighlightFooter from './components/Footer';
import EditProfile from './Screens/EditProfilePage';
import ProfilePage from './Screens/ProfileDetails';
import HomePage from './Screens/HomePage';
function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* <ContactConfirmation />
       */}
      <Header title="Home" />

      <HomePage />
      <WavyHighlightFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
