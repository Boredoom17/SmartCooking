import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { request, check, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TAB_BAR_HEIGHT } from './constants';

const ScanScreen = ({ navigation }: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(true);

  // Check permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  // Check current permission status
  const checkCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await check(permission);
      setPermissionStatus(result);
      return result;
    } catch (error) {
      console.error('Permission check error:', error);
      return RESULTS.UNAVAILABLE;
    }
  };

  // Request camera permission with proper handling
  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const currentStatus = await check(permission);
      
      if (currentStatus === RESULTS.GRANTED) {
        return true;
      }
      
      if (currentStatus === RESULTS.BLOCKED) {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is blocked. Please enable it in your device settings to scan food items.',
          [
            { 
              text: 'Cancel', 
              style: 'cancel' 
            },
            { 
              text: 'Open Settings', 
              onPress: () => openSettings() 
            }
          ]
        );
        return false;
      }
      
      const result = await request(permission);
      setPermissionStatus(result);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        Alert.alert(
          'Camera Permission Required',
          'SmartCooking needs camera access to scan food items. Please enable camera permission in your device settings.',
          [
            { 
              text: 'Cancel', 
              style: 'cancel' 
            },
            { 
              text: 'Open Settings', 
              onPress: () => openSettings() 
            }
          ]
        );
        return false;
      } else {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to scan food items.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request camera permission. Please try again.');
      return false;
    }
  };

  // Launch camera
  const handleStartScanning = async () => {
    const currentStatus = await checkCameraPermission();
    
    let hasPermission = false;
    
    if (currentStatus === RESULTS.GRANTED) {
      hasPermission = true;
    } else {
      hasPermission = await requestCameraPermission();
    }
    
    if (!hasPermission) {
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
        cameraType: 'back',
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.error('Camera error:', response.errorCode, response.errorMessage);
          Alert.alert(
            'Camera Error', 
            response.errorMessage || 'Failed to open camera. Please try again.'
          );
        } else if (response.assets && response.assets[0]) {
          const uri = response.assets[0].uri;
          setImageUri(uri || null);
          
          // Mock detected ingredients
          setIngredients(['Potato', 'Onion', 'Tomato', 'Garlic', 'Ginger']);
          // Start collapsed when ingredients are detected
          setIsIngredientsExpanded(false);
        }
      }
    );
  };

  // Handle ingredient text change
  const handleIngredientChange = (text: string, index: number) => {
    const updated = [...ingredients];
    updated[index] = text;
    setIngredients(updated);
  };

  // Remove ingredient
  const handleRemoveIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  // Add new ingredient
  const handleAddIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
    }
  };

  // Find recipes
  const handleFindRecipes = () => {
    if (ingredients.length === 0) {
      Alert.alert('No Ingredients', 'Please add at least one ingredient to find recipes.');
      return;
    }
    
    Alert.alert('Coming Soon', 'Recipe search will be implemented next!');
  };

  // Start new scan
  const handleNewScan = () => {
    setImageUri(null);
    setIngredients([]);
    setNewIngredient('');
    setIsIngredientsExpanded(true);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {!imageUri ? (
        // Initial state
        <View style={styles.emptyState}>
          <View style={styles.scanCard}>
            <View style={styles.iconContainer}>
              <Icon name="camera" size={48} color="#FDB813" />
            </View>
            <Text style={styles.scanTitle}>Food Scanner</Text>
            <Text style={styles.scanSubtitle}>
              Capture a photo to identify ingredients and find authentic Nepali recipes
            </Text>
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={handleStartScanning}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Start Scanning</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // After photo taken
        <View style={styles.resultContainer}>
          {/* Photo Preview */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          </View>

          {/* Detected Ingredients Section - Dropdown */}
          <View style={styles.ingredientsSection}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.headerLeft}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
              </View>
              <View style={styles.headerRight}>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{ingredients.length}</Text>
                </View>
                <Icon 
                  name={isIngredientsExpanded ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#718096" 
                />
              </View>
            </TouchableOpacity>
            
            {isIngredientsExpanded && (
              <>
                {ingredients.length === 0 ? (
                  <Text style={styles.emptyText}>No ingredients detected. Add manually below.</Text>
                ) : (
                  <View style={styles.ingredientsList}>
                    {ingredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientRow}>
                        <TextInput
                          style={styles.ingredientInput}
                          value={ingredient}
                          onChangeText={(text) => handleIngredientChange(text, index)}
                          placeholder="Ingredient name"
                          placeholderTextColor="#A0AEC0"
                        />
                        <TouchableOpacity
                          onPress={() => handleRemoveIngredient(index)}
                          style={styles.deleteButton}
                          activeOpacity={0.7}
                        >
                          <Icon name="close-circle" size={20} color="#E53E3E" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Ingredient Input */}
                <View style={styles.addSection}>
                  <Text style={styles.addLabel}>Add ingredient</Text>
                  <View style={styles.addIngredientContainer}>
                    <TextInput
                      style={styles.addIngredientInput}
                      value={newIngredient}
                      onChangeText={setNewIngredient}
                      placeholder="Type ingredient name"
                      placeholderTextColor="#A0AEC0"
                      onSubmitEditing={handleAddIngredient}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={handleAddIngredient}
                      activeOpacity={0.8}
                    >
                      <Icon name="plus" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Action Buttons - Side by Side */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.newScanButton]}
              onPress={handleNewScan}
              activeOpacity={0.8}
            >
              <Icon name="camera-outline" size={20} color="#5A67D8" />
              <Text style={styles.newScanText}>New Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.findRecipesButton]}
              onPress={handleFindRecipes}
              activeOpacity={0.8}
            >
              <Text style={styles.findRecipesText}>Find Recipes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  scanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FDB813',
  },
  scanTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
  },
  scanSubtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#FDB813',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#FDB813',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  // Result Container
  resultContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Ingredients Section - Dropdown
  ingredientsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: '#FDB813',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
    marginHorizontal: 16,
  },
  ingredientsList: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ingredientInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2D3748',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Add Ingredient
  addSection: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  addIngredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  addIngredientInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#2D3748',
  },
  addButton: {
    backgroundColor: '#FDB813',
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newScanButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#5A67D8',
  },
  newScanText: {
    color: '#5A67D8',
    fontSize: 15,
    fontWeight: '600',
  },
  findRecipesButton: {
    backgroundColor: '#48BB78',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  findRecipesText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ScanScreen;