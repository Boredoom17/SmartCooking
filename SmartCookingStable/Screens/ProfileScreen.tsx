import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SUPABASE_URL = 'https://eqcerlwpnrnlgzuwbhof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxY2VybHdwbnJubGd6dXdiaG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDc3NDMsImV4cCI6MjA4NDU4Mzc0M30.EVfCkxXtKxoZ5MW6s8348aMebgb9kCWyFZKaj4P-OR8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Check if user is already logged in
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setEmail(session.user.email || '');
        setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User');
        setUserData(session.user);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    if (isSignup && !username) {
      Alert.alert('Missing Username', 'Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] },
          },
        });
        if (error) throw error;
        
        Alert.alert(
          'Success! 🎉', 
          'Account created! Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => setIsSignup(false) }]
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
        
        setUsername(data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'User');
        setUserData(data.user);
        setIsLoggedIn(true);
        
        // Clear password for security
        setPassword('');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(
        'Authentication Failed', 
        error.message || 'Please check your credentials and try again'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              
              setIsLoggedIn(false);
              setUsername('');
              setEmail('');
              setPassword('');
              setUserData(null);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Logout failed');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'Reset Password',
      'Enter your email address',
      async (resetEmail) => {
        if (resetEmail) {
          try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
            if (error) throw error;
            Alert.alert('Success', 'Password reset email sent! Check your inbox.');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send reset email');
          }
        }
      },
      'plain-text',
      email
    );
  };

  // Loading state
  if (isLoading && !isLoggedIn) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FDB813" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Login/Signup Screen
  if (!isLoggedIn) {
    return (
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="chef-hat" size={48} color="#FDB813" />
            </View>
            <Text style={styles.appName}>Smart Cooking</Text>
            <Text style={styles.tagline}>Discover Nepali Flavors</Text>
          </View>

          <Text style={styles.formTitle}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isSignup ? 'Sign up to save your recipes' : 'Sign in to continue'}
          </Text>

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
              autoComplete="email"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock-outline" size={22} color="#777" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Icon 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={22} 
                color="#777" 
              />
            </TouchableOpacity>
          </View>

          {!isSignup && (
            <TouchableOpacity 
              style={styles.forgotLink}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignup ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
              <Text style={styles.switchLink}>
                {isSignup ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Profile Screen (Logged In)
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topGradient} />

      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${username}&size=200&background=FDB813&color=fff&bold=true` }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
        
        {userData?.email_confirmed_at ? (
          <View style={styles.verifiedBadge}>
            <Icon name="check-decagram" size={16} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : (
          <View style={styles.unverifiedBadge}>
            <Icon name="alert-circle" size={16} color="#FF9800" />
            <Text style={styles.unverifiedText}>Email not verified</Text>
          </View>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#FDB813' }]}>
          <Icon name="camera" size={28} color="#fff" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
          <Icon name="book-open-variant" size={28} color="#fff" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
          <Icon name="fire" size={28} color="#fff" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="history" size={24} color="#FDB813" />
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="heart" size={24} color="#e74c3c" />
            <Text style={styles.quickActionText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="food-apple" size={24} color="#4CAF50" />
            <Text style={styles.quickActionText}>Diet Plan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.optionsList}>
          {[
            { icon: 'account-edit', color: '#5A67D8', label: 'Edit Profile' },
            { icon: 'bell-ring', color: '#FDB813', label: 'Notifications' },
            { icon: 'shield-check', color: '#4CAF50', label: 'Privacy & Security' },
            { icon: 'food-variant', color: '#FF9800', label: 'Dietary Preferences' },
            { icon: 'help-circle', color: '#2196F3', label: 'Help & Support' },
            { icon: 'information', color: '#9C27B0', label: 'About' },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.optionItem}
              onPress={() => Alert.alert('Coming Soon', `${item.label} feature will be available soon!`)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.optionLabel}>{item.label}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#e74c3c" />
        ) : (
          <>
            <Icon name="logout" size={20} color="#e74c3c" />
            <Text style={styles.logoutText}>Log Out</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  contentContainer: { 
    flexGrow: 1, 
    paddingBottom: 120 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#695a44',
    fontWeight: '600' 
  },

  // Auth Screen Styles
  formCard: { 
    flex: 1,
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 32, 
    marginHorizontal: 20,
    marginVertical: 40, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.12, 
    shadowRadius: 24, 
    elevation: 10 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FDB813',
  },
  appName: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#695a44',
    letterSpacing: 0.5
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    fontWeight: '500'
  },
  formTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1a202c', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  formSubtitle: { 
    fontSize: 15, 
    color: '#718096', 
    textAlign: 'center', 
    marginBottom: 32 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f7fafc', 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0', 
    marginBottom: 16 
  },
  inputIcon: { 
    paddingLeft: 16 
  },
  input: { 
    flex: 1, 
    paddingVertical: 16, 
    paddingRight: 16, 
    fontSize: 16, 
    color: '#1a202c',
    fontWeight: '500' 
  },
  eyeIcon: {
    paddingRight: 16,
    paddingLeft: 8,
  },
  forgotLink: { 
    alignSelf: 'flex-end', 
    marginBottom: 24,
    marginTop: -8 
  },
  forgotText: { 
    color: '#FDB813', 
    fontSize: 14, 
    fontWeight: '700' 
  },
  primaryButton: { 
    backgroundColor: '#FDB813', 
    borderRadius: 12, 
    paddingVertical: 18, 
    alignItems: 'center', 
    marginBottom: 24,
    shadowColor: '#FDB813',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: { 
    color: '#000', 
    fontSize: 18, 
    fontWeight: '800',
    letterSpacing: 0.5 
  },
  switchRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 8,
    gap: 8 
  },
  switchText: { 
    color: '#718096', 
    fontSize: 15,
    fontWeight: '500' 
  },
  switchLink: { 
    color: '#FDB813', 
    fontWeight: '800' 
  },

  // Profile Screen Styles
  topGradient: { 
    height: 120, 
    backgroundColor: '#FDB813', 
    opacity: 0.08 
  },
  profileHeader: { 
    alignItems: 'center', 
    marginBottom: 32, 
    marginTop: -60,
    paddingHorizontal: 24 
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 4, 
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FDB813',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1a202c',
    marginBottom: 4 
  },
  profileEmail: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 12,
    fontWeight: '500'
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '700',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  unverifiedText: {
    color: '#FF9800',
    fontSize: 13,
    fontWeight: '700',
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 32,
    paddingHorizontal: 24,
    gap: 12 
  },
  statCard: { 
    flex: 1, 
    borderRadius: 16, 
    paddingVertical: 24, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  statNumber: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#fff',
    marginTop: 8 
  },
  statLabel: { 
    fontSize: 13, 
    color: '#fff', 
    marginTop: 4,
    fontWeight: '600',
    opacity: 0.9 
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a5568',
    marginTop: 8,
  },
  optionsList: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18, 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: { 
    flex: 1,
    fontSize: 16, 
    color: '#1a202c', 
    fontWeight: '600' 
  },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    paddingVertical: 18, 
    marginHorizontal: 24,
    borderWidth: 2, 
    borderColor: '#fee',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: { 
    color: '#e74c3c', 
    fontSize: 17, 
    fontWeight: '800' 
  },
});