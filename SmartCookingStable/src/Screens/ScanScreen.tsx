
import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { request, check, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Ionicons';
import { TAB_BAR_HEIGHT, COLORS } from '../constants';
import { convertImageToBase64, detectIngredients, DetectionResult } from '../api/inference';
import { findRecipesByIngredients, RecipeMatch } from '../api/supabase';
import { saveScanHistory } from '../api/scanHistory';
import { supabase } from '../api/supabase';

const ScanScreen = ({ navigation }: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchedRecipes, setMatchedRecipes] = useState<RecipeMatch[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // SUPER AGGRESSIVE emoji cleaner
  const cleanAllEmojis = useCallback((text: string): string => {
    if (!text || typeof text !== 'string') return '';
    
    // First, remove all Unicode emoji ranges
    let cleaned = text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[\u{E000}-\u{F8FF}]/gu, '');
    
    // Remove zero-width joiners and variation selectors
    cleaned = cleaned
      .replace(/[\u200D\uFE0F\u200B\uFEFF]/g, '');
    
    // Remove specific problematic patterns
    cleaned = cleaned
      .replace(/\b\d+(st|nd|rd|th)\s*[🚑👮‍♂️👨🚗👨❤️👨🤰🔢🎺🎷🎸🥁🏃‍♀️💃🧍‍♀️🚶‍♂️👫👬👭]/g, '')
      .replace(/[🚑👮‍♂️👨🚗👨❤️👨🤰🔢🎺🎷🎸🥁🏃‍♀️💃🧍‍♀️🚶‍♂️👫👬👭]/g, '');
    
    // Clean up
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  }, []);

  // Clean entire ingredients array
  const cleanIngredientsArray = useCallback((items: string[]): string[] => {
    return items
      .map(cleanAllEmojis)
      .filter(item => item.length > 0 && item.length < 50);
  }, [cleanAllEmojis]);

  // Check if user is logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for navigation focus to recheck auth
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkAuthStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 ScanScreen auth check:', session?.user?.id);
      setIsUserLoggedIn(!!session?.user);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsUserLoggedIn(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Check permission on mount AND clean any existing ingredients
  useEffect(() => {
    checkCameraPermission();
    
    if (ingredients.length > 0) {
      const cleaned = cleanIngredientsArray(ingredients);
      if (JSON.stringify(cleaned) !== JSON.stringify(ingredients)) {
        setIngredients(cleaned);
      }
    }
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
      console.log('Permission check error:', error);
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
          'NutriSnap needs camera access to scan food items. Please enable camera permission in your device settings.',
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
      console.log('Permission error:', error);
      Alert.alert('Error', 'Failed to request camera permission. Please try again.');
      return false;
    }
  };

  // Process image with Flask API
  const processImage = async (uri: string) => {
    setIsProcessing(true);
    setIngredients([]);
    setMatchedRecipes([]);

    try {
      console.log('Converting image to base64...');
      const base64Image = await convertImageToBase64(uri);

      console.log('Detecting ingredients...');
      const detectionResult = await detectIngredients(base64Image);

      if (!detectionResult.success) {
        throw new Error(detectionResult.error || 'Failed to detect ingredients');
      }

      console.log('API Response:', detectionResult);
      
      let detectedItems = (detectionResult as any).detected_ingredients || [];
      
      detectedItems = detectedItems.map(cleanAllEmojis).filter((item: string) => {
        return item && 
               item.length > 1 && 
               item.length < 30 &&
               !item.match(/^\d+$/) &&
               !item.match(/^[^a-zA-Z0-9]+$/) &&
               !item.toLowerCase().includes('ambulance') &&
               !item.toLowerCase().includes('police') &&
               !item.toLowerCase().includes('pregnant') &&
               !item.toLowerCase().includes('kiss');
      });
      
      if (detectedItems.length > 0) {
        setIngredients(detectedItems);
        setIsIngredientsExpanded(false);

        // Refresh auth status
        await checkAuthStatus();

        // Save to scan history with image URI
        saveScanHistory(detectedItems, uri).catch(err => 
          console.log('Could not save scan history:', err)
        );

        Alert.alert(
          'Ingredients Detected!',
          `Found ${detectedItems.length} ingredients. Tap "Find Recipes" to search.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'No Ingredients Detected',
          'Could not detect any valid ingredients in the image. Please try:\n• Better lighting\n• Clear background\n• Closer photo\n\nOr add ingredients manually below.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.log('Processing error:', error);
      Alert.alert(
        'Error',
        'Failed to process image. Please check:\n• Internet connection\n• Flask server is running\n• You are on the same WiFi network',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
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
          console.log('Camera error:', response.errorCode, response.errorMessage);
          Alert.alert(
            'Camera Error', 
            response.errorMessage || 'Failed to open camera. Please try again.'
          );
        } else if (response.assets && response.assets[0]) {
          const uri = response.assets[0].uri;
          if (uri) {
            setImageUri(uri);
            processImage(uri);
          }
        }
      }
    );
  };

  // Handle ingredient text change
  const handleIngredientChange = (text: string, index: number) => {
    const cleanedText = cleanAllEmojis(text);
    const updated = [...ingredients];
    updated[index] = cleanedText;
    setIngredients(updated);
  };

  // Remove ingredient
  const handleRemoveIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  // Add new ingredient
  const handleAddIngredient = () => {
    const trimmed = cleanAllEmojis(newIngredient);
    if (trimmed && trimmed.length > 1) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
    }
  };

  // Find recipes using Supabase
  const handleFindRecipes = async () => {
    if (ingredients.length === 0) {
      Alert.alert('No Ingredients', 'Please add at least one ingredient to find recipes.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Finding recipes for:', ingredients);
      const recipes = await findRecipesByIngredients(ingredients);
      
      console.log('Found recipes:', recipes.length);
      setMatchedRecipes(recipes);

      if (recipes.length === 0) {
        Alert.alert(
          'No Recipes Found',
          'No recipes match your ingredients. Try adding more ingredients or adjusting the list.',
          [{ text: 'OK' }]
        );
      } else {
        navigation.navigate('Recipes', { 
          matchedRecipes: recipes,
          detectedIngredients: ingredients 
        });
      }

    } catch (error) {
      console.log('Recipe search error:', error);
      Alert.alert(
        'Error',
        'Failed to search recipes. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Start new scan
  const handleNewScan = () => {
    setImageUri(null);
    setIngredients([]);
    setNewIngredient('');
    setMatchedRecipes([]);
    setIsIngredientsExpanded(true);
  };

  // Render ingredients with safety check
  const renderIngredients = () => {
    return ingredients.map((ingredient, index) => {
      const displayText = cleanAllEmojis(ingredient);
      
      if (!displayText || displayText.length === 0) {
        return null;
      }
      
      return (
        <View key={index} style={styles.ingredientRow}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <TextInput
            style={styles.ingredientInput}
            value={displayText}
            onChangeText={(text) => handleIngredientChange(text, index)}
            placeholder="Ingredient name"
            placeholderTextColor={COLORS.text.light}
          />
          <TouchableOpacity
            onPress={() => handleRemoveIngredient(index)}
            style={styles.deleteButton}
            activeOpacity={0.6}
          >
            <Icon name="close-circle" size={26} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      );
    }).filter(Boolean);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show login required if not logged in
  if (!isUserLoggedIn) {
    return (
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyState}>
          <View style={styles.scanCard}>
            <View style={styles.iconContainer}>
              <Icon name="lock-closed-outline" size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.scanTitle}>Login Required</Text>
            <Text style={styles.scanSubtitle}>
              Please sign in to scan ingredients and track your history
            </Text>
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.85}
            >
              <Icon name="log-in-outline" size={24} color={COLORS.white} style={styles.buttonIcon} />
              <Text style={styles.startButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Main scan interface (user is logged in)
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {!imageUri ? (
        <View style={styles.emptyState}>
          <View style={styles.scanCard}>
            <View style={styles.iconContainer}>
              <Icon name="camera-outline" size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.scanTitle}>NutriSnap</Text>
            <Text style={styles.scanSubtitle}>
              Capture a photo to identify ingredients and find suitable recipes
            </Text>
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={handleStartScanning}
              activeOpacity={0.85}
              disabled={isProcessing}
            >
              <Icon name="camera" size={24} color={COLORS.white} style={styles.buttonIcon} />
              <Text style={styles.startButtonText}>Start Scanning</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <View style={styles.processingCard}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.processingText}>Analyzing ingredients...</Text>
                  <Text style={styles.processingSubtext}>This may take a few seconds</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.ingredientsSection}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.headerLeft}>
                <Icon name="nutrition-outline" size={24} color={COLORS.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Ingredients</Text>
              </View>
              <View style={styles.headerRight}>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{ingredients.length}</Text>
                </View>
                <Icon 
                  name={isIngredientsExpanded ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color={COLORS.text.muted} 
                />
              </View>
            </TouchableOpacity>
            
            {isIngredientsExpanded && (
              <>
                {ingredients.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="search-outline" size={48} color={COLORS.text.light} />
                    <Text style={styles.emptyText}>
                      {isProcessing 
                        ? 'Detecting ingredients...' 
                        : 'No ingredients detected. Add manually below.'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.ingredientsList}>
                    {renderIngredients()}
                  </View>
                )}

                <View style={styles.addSection}>
                  <View style={styles.addLabelContainer}>
                    <Icon name="add-circle-outline" size={20} color={COLORS.text.muted} />
                    <Text style={styles.addLabel}>Add ingredient</Text>
                  </View>
                  <View style={styles.addIngredientContainer}>
                    <TextInput
                      style={styles.addIngredientInput}
                      value={newIngredient}
                      onChangeText={setNewIngredient}
                      placeholder="Type ingredient name"
                      placeholderTextColor={COLORS.text.light}
                      onSubmitEditing={handleAddIngredient}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        !newIngredient.trim() && styles.addButtonDisabled
                      ]}
                      onPress={handleAddIngredient}
                      activeOpacity={0.8}
                      disabled={!newIngredient.trim()}
                    >
                      <Icon name="checkmark" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.newScanButton]}
              onPress={handleNewScan}
              activeOpacity={0.75}
              disabled={isProcessing}
            >
              <Icon name="camera-outline" size={22} color={COLORS.accent} />
              <Text style={styles.newScanText}>New Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.findRecipesButton,
                (isProcessing || ingredients.length === 0) && styles.disabledButton
              ]}
              onPress={handleFindRecipes}
              activeOpacity={0.85}
              disabled={isProcessing || ingredients.length === 0}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Icon name="book-outline" size={22} color={COLORS.white} />
                  <Text style={styles.findRecipesText}>Find Recipes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Icon name="information-circle-outline" size={22} color="#2C5282" />
              <Text style={styles.tipsTitle}>Tips for better results</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="create-outline" size={16} color="#2C5282" />
              <Text style={styles.tipText}>Edit detected ingredients if needed</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="add-circle-outline" size={16} color="#2C5282" />
              <Text style={styles.tipText}>Add missing ingredients manually</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="sunny-outline" size={16} color="#2C5282" />
              <Text style={styles.tipText}>Use good lighting for better accuracy</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.muted,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  scanCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  scanTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  scanSubtitle: {
    fontSize: 15,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 10,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resultContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  processingText: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  processingSubtext: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.text.muted,
  },
  ingredientsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 32,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  countText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.light,
    textAlign: 'center',
    marginTop: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  ingredientsList: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A67D8',
  },
  ingredientInput: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 15,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 8,
  },
  addSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  addLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.muted,
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  addIngredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  addIngredientInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#D4D4D4',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newScanButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  newScanText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  findRecipesButton: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  findRecipesText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabledButton: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  tipsContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 18,
    backgroundColor: '#EBF8FF',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3182CE',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C5282',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#2C5282',
    marginLeft: 10,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default ScanScreen;






