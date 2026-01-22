import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DevSettings } from 'react-native';

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // optional for login form

  useEffect(() => {
    AsyncStorage.getItem('isLoggedIn').then((val) => setIsLoggedIn(!!val));
    AsyncStorage.getItem('username').then((val) => setUsername(val || 'Guest'));
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter email and password');
      return;
    }
    // Mock – later replace with real auth
    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('username', email.split('@')[0]);
    setUsername(email.split('@')[0]);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['isLoggedIn', 'username']);
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  // ──── Dev reset (keep for now, remove later) ────
  const resetAndReload = async () => {
    try {
      await AsyncStorage.multiRemove(['hasSeenOnboarding', 'isLoggedIn', 'username']);
      Alert.alert('Reset Done', 'App will reload in 1.5 seconds...');
      setTimeout(() => DevSettings.reload(), 1500);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Reset failed';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {!isLoggedIn ? (
        // ──── Login Form ────
        <View style={styles.formCard}>
          <View style={styles.logoContainer}>
            <Icon name="food-apple" size={64} color="#695a44" />
            <Text style={styles.appName}>NutriSnap</Text>
          </View>

          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to continue</Text>

          <View style={styles.inputWrapper}>
            <Icon name="email-outline" size={22} color="#777" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock-outline" size={22} color="#777" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
          </View>

          <TouchableOpacity style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Dev reset button */}
          <TouchableOpacity style={styles.devReset} onPress={resetAndReload}>
            <Text style={styles.devResetText}>[DEV] Reset & Reload</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ──── Logged-in Profile ────
        <View style={styles.profileContent}>
          {/* Header */}
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: `https://i.pravatar.cc/150?u=${username}` }}
              style={styles.avatar}
            />
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileHandle}>@{username.toLowerCase().replace(/\s/g, '')}</Text>
            <Text style={styles.profileBio}>
              Passionate about healthy eating • Exploring smart recipes
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>34</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>187</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.9 ★</Text>
              <Text style={styles.statLabel}>Avg. Rating</Text>
            </View>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {[
              { icon: 'heart-outline', label: 'Favorites' },
              { icon: 'history', label: 'Scan History' },
              { icon: 'bell-outline', label: 'Notifications' },
              { icon: 'cog-outline', label: 'Settings' },
              { icon: 'help-circle-outline', label: 'Help & Support' },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.optionItem}>
                <Icon name={item.icon} size={24} color="#695a44" />
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Icon name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#e74c3c" style={{ marginRight: 12 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {/* Dev reset */}
          <TouchableOpacity style={styles.devReset} onPress={resetAndReload}>
            <Text style={styles.devResetText}>[DEV] Reset & Reload App</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },

  // ──── Login Form ────
  formCard: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginVertical: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#695a44',
    marginTop: 12,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: 16,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: '#333',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#FDB813',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#FDB813',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#666',
    fontSize: 15,
  },
  signupLink: {
    color: '#FDB813',
    fontWeight: '600',
  },

  // ──── Logged-in Profile ────
  profileContent: {
    flex: 1,
    paddingTop: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FDB813',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  profileHandle: {
    fontSize: 15,
    color: '#777',
    marginTop: 4,
  },
  profileBio: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#695a44',
  },
  statLabel: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
  },
  optionsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  devReset: {
    marginTop: 60,
    padding: 14,
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe082',
    alignItems: 'center',
  },
  devResetText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
  },
});