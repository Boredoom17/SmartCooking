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
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function ScanScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<string>(RESULTS.UNAVAILABLE);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const camPerm = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const camResult = await check(camPerm);
    setCameraStatus(camResult);
  };

  const requestCamera = async (): Promise<boolean> => {
    const perm = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const result = await request(perm);
    setCameraStatus(result);
    return result === RESULTS.GRANTED;
  };

  const showSettingsAlert = () => {
    Alert.alert(
      'Camera Permission Required',
      'This feature requires camera access.\n\nPlease enable it in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Settings',
          onPress: () => openSettings().catch(() => Alert.alert('Unable to open settings')),
        },
      ]
    );
  };

  const handleScan = async () => {
    if (cameraStatus !== RESULTS.GRANTED) {
      const granted = await requestCamera();
      if (!granted) {
        if (cameraStatus === RESULTS.BLOCKED || cameraStatus === RESULTS.DENIED) {
          showSettingsAlert();
        }
        return;
      }
    }

    setIsLoading(true);
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
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
          mockBackendAnalysis();  // Mock backend call
        }
      }
    );
  };

  const mockBackendAnalysis = () => {
    // Mock backend – replace with real API call later
    setIsLoading(true);
    setTimeout(() => {
      setIngredients(['Potato', 'Onion', 'Cheese', 'Tomato', 'Spices']);  // Dummy from "backend"
      setIsLoading(false);
    }, 1500);
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  const handleShowRecipes = () => {
    // Navigate to Recipes screen with ingredients
    type RootStackParamList = {
    Home: undefined;
    Recipes: { ingredients: string[] };
};

  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Food</Text>
        <Text style={styles.subtitle}>
          Take a photo to detect ingredients automatically
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FDB813" />
          <Text style={styles.loadingText}>Analyzing...</Text>
        </View>
      ) : imageUri ? (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <Text style={styles.ingredientsTitle}>Detected Ingredients:</Text>
          <FlatList
            data={ingredients}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>{item}</Text>
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <Icon name="delete" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.noIngredients}>No ingredients detected</Text>}
          />

          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
            <Icon name="pencil" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit Ingredients</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recipesButton} onPress={handleShowRecipes}>
            <Icon name="book-open-variant" size={20} color="#fff" />
            <Text style={styles.buttonText}>Show Recipes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retryButton} onPress={() => setImageUri(null)}>
            <Icon name="camera-retake" size={24} color="#fff" />
            <Text style={styles.retryText}>Take New Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionCard, styles.cameraCard]} onPress={handleScan}>
            <Icon name="camera" size={56} color="#fff" />
            <Text style={styles.cardTitle}>Scan Now</Text>
            <Text style={styles.cardSubtitle}>Take a photo of your food</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Ingredient</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new ingredient"
              value={newIngredient}
              onChangeText={setNewIngredient}
            />
            <TouchableOpacity style={styles.modalAddButton} onPress={addIngredient}>
              <Text style={styles.modalButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 30, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24 },
  actions: { width: '100%', alignItems: 'center' },
  actionCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  cameraCard: { backgroundColor: '#3b82f6' },
  cardTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginTop: 16 },
  cardSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 8 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
  loadingText: { marginTop: 20, fontSize: 16, color: '#4b5563', fontWeight: '500' },
  previewWrapper: { width: '100%', alignItems: 'center' },
  previewImage: { width: '100%', height: 420, borderRadius: 20, backgroundColor: '#e5e7eb', marginBottom: 24 },
  ingredientsTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  ingredientItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', width: '100%' },
  ingredientText: { fontSize: 16, color: '#333' },
  noIngredients: { fontSize: 16, color: '#777', textAlign: 'center' },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDB813', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, marginTop: 24 },
  recipesButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, marginTop: 24 },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  modalInput: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 16 },
  modalAddButton: { backgroundColor: '#FDB813', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, marginBottom: 12 },
  modalCloseButton: { backgroundColor: '#ddd', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});