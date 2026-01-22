import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<string>(RESULTS.UNAVAILABLE);
  const [galleryStatus, setGalleryStatus] = useState<string>(RESULTS.UNAVAILABLE);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Camera permission
    const camPerm =
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const camResult = await check(camPerm);
    setCameraStatus(camResult);

    // Gallery / Photos permission
    const galleryPerm =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
    const galleryResult = await check(galleryPerm);
    setGalleryStatus(galleryResult);
  };

  const requestCamera = async (): Promise<boolean> => {
    const perm =
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const result = await request(perm);
    setCameraStatus(result);
    return result === RESULTS.GRANTED;
  };

  const requestGallery = async (): Promise<boolean> => {
    const perm =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
    const result = await request(perm);
    setGalleryStatus(result);
    return result === RESULTS.GRANTED;
  };

  const showSettingsAlert = (type: 'camera' | 'gallery') => {
    Alert.alert(
      `${type === 'camera' ? 'Camera' : 'Photos'} Permission Required`,
      `This feature requires ${type} access.\n\nPlease enable it in your device settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Settings',
          onPress: () => openSettings().catch(() => Alert.alert('Unable to open settings')),
        },
      ]
    );
  };

  const handleScanWithCamera = async () => {
    if (cameraStatus !== RESULTS.GRANTED) {
      const granted = await requestCamera();
      if (!granted) {
        if (cameraStatus === RESULTS.BLOCKED || cameraStatus === RESULTS.DENIED) {
          showSettingsAlert('camera');
        }
        return;
      }
    }

    setIsLoading(true);
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,           // number is correct in v5.1.0
        saveToPhotos: false,
      },
      (res) => {
        setIsLoading(false);
        if (res.didCancel) return;
        if (res.errorCode) {
          Alert.alert('Camera Error', res.errorMessage || 'Failed to open camera');
          return;
        }
        if (res.assets?.[0]?.uri) {
          setImageUri(res.assets[0].uri);
        }
      }
    );
  };

  const handlePickFromGallery = async () => {
    if (galleryStatus !== RESULTS.GRANTED) {
      const granted = await requestGallery();
      if (!granted) {
        if (galleryStatus === RESULTS.BLOCKED || galleryStatus === RESULTS.DENIED) {
          showSettingsAlert('gallery');
        }
        return;
      }
    }

    setIsLoading(true);
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,           // number is correct in v5.1.0
        selectionLimit: 1,
      },
      (res) => {
        setIsLoading(false);
        if (res.didCancel) return;
        if (res.errorCode) {
          Alert.alert('Gallery Error', res.errorMessage || 'Failed to open gallery');
          return;
        }
        if (res.assets?.[0]?.uri) {
          setImageUri(res.assets[0].uri);
        }
      }
    );
  };

  const clearPreview = () => setImageUri(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Scan Food</Text>
        <Text style={styles.subtitle}>
          Capture or upload a photo to discover ingredients and nutrition info
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FDB813" />
          <Text style={styles.loadingText}>Preparing...</Text>
        </View>
      ) : imageUri ? (
        <View style={styles.previewWrapper}>
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <View style={styles.previewOverlay}>
            <Text style={styles.overlayText}>Analyzing your food...</Text>
            <Text style={styles.overlaySubtext}>AI-powered results coming soon</Text>
          </View>

          <TouchableOpacity style={styles.retryButton} onPress={clearPreview}>
            <Icon name="camera-retake" size={24} color="#fff" />
            <Text style={styles.retryText}>New Scan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.cameraCard]}
            onPress={handleScanWithCamera}
          >
            <Icon name="camera" size={56} color="#fff" />
            <Text style={styles.cardTitle}>Camera</Text>
            <Text style={styles.cardSubtitle}>Take a fresh photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.galleryCard]}
            onPress={handlePickFromGallery}
          >
            <Icon name="image-multiple" size={56} color="#fff" />
            <Text style={styles.cardTitle}>Gallery</Text>
            <Text style={styles.cardSubtitle}>Select from photos</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 140,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  actionCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  cameraCard: {
    backgroundColor: '#3b82f6',
  },
  galleryCard: {
    backgroundColor: '#10b981',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    marginTop: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 120,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  previewWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 420,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginBottom: 24,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  overlaySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});