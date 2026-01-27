import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RecipeMatch, getRecipeDetails, RecipeDetail } from '../api/supabase';

type RecipesRouteProp = RouteProp<
  {
    Recipes: {
      matchedRecipes: RecipeMatch[];
      detectedIngredients: string[];
    };
  },
  'Recipes'
>;

export default function RecipesScreen() {
  const route = useRoute<RecipesRouteProp>();
  const { matchedRecipes = [], detectedIngredients = [] } = route.params ?? {};

  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    ingredients: true,
    instructions: false,
  });
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleRecipePress = async (recipeId: number) => {
    try {
      setIsLoadingDetail(true);
      const details = await getRecipeDetails(recipeId);
      setSelectedRecipe(details);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to load recipe details:', error);
      Alert.alert('Error', 'Failed to load recipe details. Please try again.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const toggleSection = (key: 'ingredients' | 'instructions') => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedRecipe(null);
    setExpandedSections({ ingredients: true, instructions: false });
  };

  if (matchedRecipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="search-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No recipes found</Text>
        <Text style={styles.emptySubtext}>
          Try adjusting your ingredients or add more items
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {matchedRecipes.map(recipe => {
          const hasImageError = imageErrors[recipe.recipe_id];
          const shouldShowImage = recipe.image_url && !hasImageError;

          return (
            <TouchableOpacity
              key={recipe.recipe_id}
              style={styles.card}
              onPress={() => handleRecipePress(recipe.recipe_id)}
              activeOpacity={0.7}
            >
              {shouldShowImage && recipe.image_url ? (
                <Image
                  source={{ uri: recipe.image_url }}
                  style={styles.image}
                  onError={() =>
                    setImageErrors(prev => ({
                      ...prev,
                      [recipe.recipe_id]: true,
                    }))
                  }
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imageFallback}>
                  <Icon name="restaurant" size={40} color="#fff" />
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                  {recipe.recipe_name}
                </Text>
                <View style={styles.matchBadge}>
                  <Icon name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.matchText}>
                    {recipe.match_percentage}% match
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Recipe Details</Text>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {isLoadingDetail ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text style={styles.loadingText}>Loading recipe...</Text>
            </View>
          ) : selectedRecipe ? (
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Recipe Image */}
              {selectedRecipe.image_url ? (
                <Image
                  source={{ uri: selectedRecipe.image_url }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.modalImageFallback}>
                  <Icon name="restaurant" size={60} color="#fff" />
                </View>
              )}

              {/* Recipe Title & Info */}
              <View style={styles.recipeHeader}>
                <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                {selectedRecipe.name_nepali && (
                  <Text style={styles.modalTitleNepali}>
                    {selectedRecipe.name_nepali}
                  </Text>
                )}
                
                <View style={styles.recipeMetaContainer}>
                  <View style={styles.metaItem}>
                    <Icon name="time-outline" size={18} color="#666" />
                    <Text style={styles.metaText}>
                      {selectedRecipe.prep_time_minutes + selectedRecipe.cook_time_minutes} min
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="people-outline" size={18} color="#666" />
                    <Text style={styles.metaText}>
                      {selectedRecipe.servings} servings
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="bar-chart-outline" size={18} color="#666" />
                    <Text style={styles.metaText}>
                      {selectedRecipe.difficulty}
                    </Text>
                  </View>
                </View>

                {selectedRecipe.description && (
                  <Text style={styles.description}>
                    {selectedRecipe.description}
                  </Text>
                )}
              </View>

              {/* Ingredients Section */}
              <View style={styles.section}>
                <TouchableOpacity
                  onPress={() => toggleSection('ingredients')}
                  style={styles.sectionHeader}
                >
                  <View style={styles.sectionHeaderLeft}>
                    <Icon name="nutrition-outline" size={24} color="#f59e0b" />
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                  </View>
                  <Icon
                    name={expandedSections.ingredients ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>

                {expandedSections.ingredients && (
                  <View style={styles.sectionContent}>
                    {selectedRecipe.recipe_ingredients.length > 0 ? (
                      selectedRecipe.recipe_ingredients.map((item, idx) => (
                        <View key={idx} style={styles.ingredientItem}>
                          <Icon 
                            name={item.is_essential ? "checkmark-circle" : "ellipse-outline"} 
                            size={18} 
                            color={item.is_essential ? "#10b981" : "#999"} 
                          />
                          <Text style={styles.ingredientText}>
                            {item.quantity} {item.ingredient.name}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No ingredients listed</Text>
                    )}
                  </View>
                )}
              </View>

              {/* Instructions Section */}
              <View style={styles.section}>
                <TouchableOpacity
                  onPress={() => toggleSection('instructions')}
                  style={styles.sectionHeader}
                >
                  <View style={styles.sectionHeaderLeft}>
                    <Icon name="list-outline" size={24} color="#f59e0b" />
                    <Text style={styles.sectionTitle}>Instructions</Text>
                  </View>
                  <Icon
                    name={expandedSections.instructions ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>

                {expandedSections.instructions && (
                  <View style={styles.sectionContent}>
                    {selectedRecipe.instructions ? (
                      <Text style={styles.instructionsText}>
                        {selectedRecipe.instructions}
                      </Text>
                    ) : (
                      <Text style={styles.noDataText}>No instructions available</Text>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.bottomPadding} />
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  imageFallback: {
    width: '100%',
    height: 200,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f3f4f6',
  },
  modalImageFallback: {
    width: '100%',
    height: 250,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalTitleNepali: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 12,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    marginTop: 8,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  instructionsText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 40,
  },
});