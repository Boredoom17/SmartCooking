

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
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS, TAB_BAR_HEIGHT } from '../constants';
import { supabase } from '../api/supabase'; 

interface ScanHistory {
  id: string;
  user_id: string;
  ingredients: string[];
  image_url?: string;
  created_at: string;
}

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (isLoggedIn && userData?.id) {
      fetchScanHistory();
    }
  }, [isLoggedIn, userData]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 ProfileScreen session check:', session?.user?.id);
      if (session?.user) {
        setIsLoggedIn(true);
        setEmail(session.user.email || '');
        setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User');
        setProfileImage(session.user.user_metadata?.profile_image || null);
        setUserData(session.user);
        setEditUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScanHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setScanHistory(data || []);
      setTotalScans(data?.length || 0);
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  const handleAuth = async () => {
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
          'Account Created! 🎉', 
          'Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => setIsSignup(false) }]
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
        
        console.log('✅ Login successful:', data.user?.id);
        setUsername(data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'User');
        setProfileImage(data.user?.user_metadata?.profile_image || null);
        setUserData(data.user);
        setIsLoggedIn(true);
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
              setProfileImage(null);
              setScanHistory([]);
              setTotalScans(0);
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

  const handleProfileImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 400,
        maxHeight: 400,
      });

      if (result.assets && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        // Update user metadata
        const { error } = await supabase.auth.updateUser({
          data: { profile_image: imageUri }
        });
        
        if (error) throw error;
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: editUsername }
      });

      if (error) throw error;
      
      setUsername(editUsername);
      setShowEditProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !isLoggedIn) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Login/Signup Screen
  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.authContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Icon name="nutrition-outline" size={56} color={COLORS.primary} />
              </View>
              <Text style={styles.appName}>NutriSnap</Text>
            </View>

            <Text style={styles.formTitle}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isSignup ? 'Sign up to track your scans' : 'Sign in to continue'}
            </Text>

            {isSignup && (
              <View style={styles.inputWrapper}>
                <Icon name="person-outline" size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Icon name="mail-outline" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Icon name="lock-closed-outline" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholderTextColor="#A0AEC0"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color="#718096" 
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
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
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
      </KeyboardAvoidingView>
    );
  }

  // Profile Screen (Logged In)
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.profileContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerGradient} />

      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              profileImage 
                ? { uri: profileImage }
                : { uri: `https://ui-avatars.com/api/?name=${username}&size=200&background=FDB813&color=fff&bold=true` }
            }
            style={styles.avatar}
          />
          <TouchableOpacity 
            style={styles.editAvatarButton}
            onPress={handleProfileImagePick}
            activeOpacity={0.8}
          >
            <Icon name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
        
        {userData?.email_confirmed_at ? (
          <View style={styles.verifiedBadge}>
            <Icon name="checkmark-circle" size={16} color="#48BB78" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : (
          <View style={styles.unverifiedBadge}>
            <Icon name="alert-circle-outline" size={16} color="#FF9800" />
            <Text style={styles.unverifiedText}>Email not verified</Text>
          </View>
        )}
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        <View style={styles.optionsList}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              setEditUsername(username);
              setShowEditProfile(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E8EAF6' }]}>
                <Icon name="person-outline" size={22} color="#5A67D8" />
              </View>
              <Text style={styles.optionLabel}>Edit Profile</Text>
            </View>
            <Icon name="chevron-forward" size={22} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              setShowHistory(true);
              fetchScanHistory();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF9E6' }]}>
                <Icon name="time-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.optionLabel}>Scan History</Text>
            </View>
            <View style={styles.optionRight}>
              {totalScans > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{totalScans}</Text>
                </View>
              )}
              <Icon name="chevron-forward" size={22} color="#CBD5E0" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => Alert.alert('Notifications', 'Notification settings coming soon!')}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="notifications-outline" size={22} color="#FF9800" />
              </View>
              <Text style={styles.optionLabel}>Notifications</Text>
            </View>
            <Icon name="chevron-forward" size={22} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => Alert.alert('Help & Support', 'Contact us at support@nutrisnap.com\n\nWe\'re here to help!')}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="help-circle-outline" size={22} color="#2196F3" />
              </View>
              <Text style={styles.optionLabel}>Help & Support</Text>
            </View>
            <Icon name="chevron-forward" size={22} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionItem, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert('About NutriSnap', 'Version 1.0.0\n\nDiscover authentic Nepali recipes by scanning ingredients.\n\n© 2026 NutriSnap')}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F3E5F5' }]}>
                <Icon name="information-circle-outline" size={22} color="#9C27B0" />
              </View>
              <Text style={styles.optionLabel}>About</Text>
            </View>
            <Icon name="chevron-forward" size={22} color="#CBD5E0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#E53E3E" />
        ) : (
          <>
            <Icon name="log-out-outline" size={22} color="#E53E3E" />
            <Text style={styles.logoutText}>Log Out</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Icon name="close" size={28} color="#4A5568" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Username</Text>
              <TextInput
                style={styles.modalInput}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Enter username"
                placeholderTextColor="#A0AEC0"
              />

              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleUpdateProfile}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scan History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Icon name="close" size={28} color="#4A5568" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={scanHistory}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.historyList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyHistory}>
                  <Icon name="scan-outline" size={64} color="#CBD5E0" />
                  <Text style={styles.emptyHistoryText}>No scan history yet</Text>
                  <Text style={styles.emptyHistorySubtext}>
                    Start scanning ingredients to see your history here
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyIconContainer}>
                    <Icon name="nutrition-outline" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyIngredients}>
                      {item.ingredients.join(', ')}
                    </Text>
                    <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
                  </View>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeText}>{item.ingredients.length}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      <View style={{ height: TAB_BAR_HEIGHT + 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    paddingBottom: TAB_BAR_HEIGHT + 40,
  },
  profileContainer: {
    flexGrow: 1,
    paddingBottom: TAB_BAR_HEIGHT + 40,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: COLORS.text.muted,
    fontWeight: '600',
  },

  // Auth Screen Styles
  formCard: { 
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  appName: { 
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  formTitle: { 
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  formSubtitle: { 
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputWrapper: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  inputIcon: { 
    paddingLeft: 12,
    paddingRight: 8,
  },
  input: { 
    flex: 1,
    paddingVertical: 14,
    paddingRight: 12,
    fontSize: 15,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  forgotLink: { 
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -6,
  },
  forgotText: { 
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: { 
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: { 
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  switchRow: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  switchText: { 
    color: COLORS.text.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  switchLink: { 
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  // Profile Screen Styles
  headerGradient: { 
    height: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
  },
  profileHeader: { 
    alignItems: 'center',
    marginBottom: 32,
    marginTop: -50,
    paddingHorizontal: 24,
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
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileName: { 
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: COLORS.text.muted,
    marginBottom: 12,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedText: {
    color: '#48BB78',
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  optionsList: { 
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  logoutButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 18,
    marginHorizontal: 24,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: { 
    color: '#E53E3E',
    fontSize: 17,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  modalBody: {
    padding: 24,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },

  // History Styles
  historyList: {
    padding: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyIngredients: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    color: COLORS.text.muted,
    fontWeight: '500',
  },
  historyBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  historyBadgeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  }

});
