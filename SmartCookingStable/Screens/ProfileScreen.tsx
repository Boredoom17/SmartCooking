import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SUPABASE_URL = 'https://eqcerlwpnrnlgzuwbhof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxY2VybHdwbnJubGd6dXdiaG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDc3NDMsImV4cCI6MjA4NDU4Mzc0M30.EVfCkxXtKxoZ5MW6s8348aMebgb9kCWyFZKaj4P-OR8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false); // Toggle login/signup
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] }, // Save username in metadata
          },
        });
        if (error) throw error;
        Alert.alert('Success', 'Account created! Check your email to confirm.');
        setIsSignup(false); // Switch back to login
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUsername(data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'User');
        setIsLoggedIn(true);
      }
    } catch (error) {
Alert.alert('Error', (error as Error).message || 'Authentication failed');    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsLoggedIn(false);
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
Alert.alert('Error', (error as Error).message || 'Logout failed');      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loading" size={48} color="#FDB813" />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formCard}>
          <View style={styles.logoContainer}>
            <Icon name="food-apple" size={64} color="#695a44" />
            <Text style={styles.appName}>Smart Cooking</Text>
          </View>

          <Text style={styles.formTitle}>{isSignup ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.formSubtitle}>{isSignup ? 'Sign up to get started' : 'Sign in to continue'}</Text>

          {isSignup && (
            <View style={styles.inputWrapper}>
              <Icon name="account-outline" size={22} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#aaa"
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Icon name="email-outline" size={22} color="#777" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
              placeholderTextColor="#aaa"
            />
          </View>

          {!isSignup && (
            <TouchableOpacity style={styles.forgotLink}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.buttonText}>{isSignup ? 'Sign Up' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
              <Text style={styles.switchLink}>{isSignup ? 'Sign In' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Colorful Top UI – Gaming inspired with more space at top */}
      <View style={styles.topGradient} />

      <View style={styles.profileHeader}>
        <Image
          source={{ uri: `https://i.pravatar.cc/150?u=${username}` }}
          style={styles.avatar}
        />
        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileHandle}>@{username.toLowerCase().replace(/\s/g, '')}</Text>
        <Text style={styles.profileBio}>
          Healthy eating enthusiast • 150+ recipes tried • Joined 2023
        </Text>
      </View>

      {/* Stats in colorful cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#FDB813' }]}>
          <Icon name="camera" size={28} color="#fff" />
          <Text style={styles.statNumber}>42</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
          <Icon name="book-open-variant" size={28} color="#fff" />
          <Text style={styles.statNumber}>126</Text>
          <Text style={styles.statLabel}>Recipes Saved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
          <Icon name="star" size={28} color="#fff" />
          <Text style={styles.statNumber}>4.7</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Options List */}
      <View style={styles.optionsList}>
        {[
          { icon: 'heart', color: '#e74c3c', label: 'Favorites' },
          { icon: 'history', color: '#34495e', label: 'Scan History' },
          { icon: 'account-settings', color: '#8e44ad', label: 'Settings' },
          { icon: 'help-circle', color: '#f39c12', label: 'Help & Support' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.optionItem}>
            <Icon name={item.icon} size={24} color={item.color} />
            <Text style={styles.optionLabel}>{item.label}</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#e74c3c" style={{ marginRight: 12 }} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 140 },
  topGradient: { height: 100, backgroundColor: '#FDB813', opacity: 0.15 }, // Subtle colorful top fade
  formCard: { flex: 1, justifyContent: 'center', backgroundColor: '#fff', borderRadius: 24, padding: 32, marginVertical: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  appName: { fontSize: 24, fontWeight: '700', color: '#695a44', marginTop: 12 },
  formTitle: { fontSize: 26, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 8 },
  formSubtitle: { fontSize: 15, color: '#777', textAlign: 'center', marginBottom: 32 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#e5e5e5', marginBottom: 16 },
  inputIcon: { paddingLeft: 16 },
  input: { flex: 1, paddingVertical: 14, paddingRight: 16, fontSize: 16, color: '#333' },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#FDB813', fontSize: 14, fontWeight: '600' },
  primaryButton: { backgroundColor: '#FDB813', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#000', fontSize: 17, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  switchText: { color: '#666', fontSize: 15 },
  switchLink: { color: '#FDB813', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#695a44' },
  profileHeader: { alignItems: 'center', marginBottom: 32, marginTop: 40 }, // More space at top
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#FDB813', marginBottom: 16 },
  profileName: { fontSize: 26, fontWeight: '700', color: '#333' },
  profileHandle: { fontSize: 15, color: '#777', marginTop: 4 },
  profileBio: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 12, paddingHorizontal: 40 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: { flex: 1, borderRadius: 16, paddingVertical: 20, marginHorizontal: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 13, color: '#fff', marginTop: 6 },
  optionsList: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  optionLabel: { flex: 1, fontSize: 16, color: '#333', marginLeft: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, borderWidth: 1, borderColor: '#ffebee' },
  logoutText: { color: '#e74c3c', fontSize: 17, fontWeight: '600', marginLeft: 8 },
});