
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, TAB_BAR_HEIGHT } from '../constants';
import { RecipeMatch, getRecipeDetails, RecipeDetail } from '../api/supabase';

type RecipesRouteProp = RouteProp<
  { Recipes: { matchedRecipes: RecipeMatch[]; detectedIngredients: string[] } },
  'Recipes'
>;

export default function RecipesScreen() {
  const route = useRoute<RecipesRouteProp>();
  const { matchedRecipes = [], detectedIngredients = [] } = route.params || {};

  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Categorize recipes by match percentage
  const perfectMatches = matchedRecipes.filter((r) => r.match_percentage >= 90);
  const goodMatches = matchedRecipes.filter((r) => r.match_percentage >= 50 && r.match_percentage < 90);
  const otherRecipes = matchedRecipes.filter((r) => r.match_percentage < 50);

  const handleRecipePress = async (recipeId: number) => {
    setIsLoadingDetail(true);
    try {
      const details = await getRecipeDetails(recipeId);
      setSelectedRecipe(details);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading recipe details:', error);
      Alert.alert('Error', 'Failed to load recipe details. Please try again.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getPlaceholderImage = (recipeName: string) => {
    // Generate a consistent color based on recipe name
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    const index = recipeName.length % colors.length;
    return colors[index];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#48BB78';
      case 'medium': return '#FF9800';
      case 'hard': return '#E53E3E';
      default: return '#718096';
    }
  };

  const renderRecipeCard = (recipe: RecipeMatch) => {
    const placeholderColor = getPlaceholderImage(recipe.recipe_name);
    
    return (
      <TouchableOpacity
        key={recipe.recipe_id}
        style={styles.recipeCard}
        onPress={() => handleRecipePress(recipe.recipe_id)}
        activeOpacity={0.8}
      >
        {/* Placeholder Image */}
        <View style={[styles.recipeImage, { backgroundColor: placeholderColor }]}>
          <Icon name="restaurant-outline" size={40} color="rgba(255,255,255,0.8)" />
        </View>

        <View style={styles.recipeContent}>
          <View style={styles.recipeHeader}>
            <View style={styles.recipeTitleContainer}>
              <Text style={styles.recipeName} numberOfLines={2}>
                {recipe.recipe_name}
              </Text>
              <Text style={styles.recipeNameNepali} numberOfLines={1}>
                {recipe.recipe_name_nepali}
              </Text>
            </View>
            
            <View style={styles.matchBadge}>
              <Text style={styles.matchPercentage}>{recipe.match_percentage}%</Text>
            </View>
          </View>

          {recipe.missing_ingredients.length > 0 && (
            <View style={styles.missingSection}>
              <Icon name="alert-circle-outline" size={14} color="#FF9800" />
              <Text style={styles.missingText} numberOfLines={1}>
                Missing: {recipe.missing_ingredients.join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.recipeFooter}>
            <Icon name="chevron-forward" size={20} color={COLORS.primary} />
            <Text style={styles.tapToView}>Tap to view recipe</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, recipes: RecipeMatch[], icon: string, color: string) => {
    if (recipes.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconContainer, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={24} color={color} />
          </View>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionCount}>{recipes.length} recipes</Text>
          </View>
        </View>
        
        {recipes.map(renderRecipeCard)}
      </View>
    );
  };

  if (matchedRecipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Icon name="restaurant-outline" size={80} color={COLORS.text.light} />
          <Text style={styles.emptyTitle}>No Recipes Found</Text>
          <Text style={styles.emptyText}>
            We couldn't find any recipes matching your ingredients.{'\n'}Try scanning different items!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Icon name="restaurant" size={32} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Recipe Results</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Found {matchedRecipes.length} recipes for your ingredients
          </Text>
          <View style={styles.ingredientsChips}>
            {detectedIngredients.slice(0, 4).map((ingredient, index) => (
              <View key={index} style={styles.ingredientChip}>
                <Text style={styles.ingredientChipText}>{ingredient}</Text>
              </View>
            ))}
            {detectedIngredients.length > 4 && (
              <View style={styles.ingredientChip}>
                <Text style={styles.ingredientChipText}>+{detectedIngredients.length - 4}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Perfect Matches */}
        {renderSection('Perfect Matches', perfectMatches, 'star', '#48BB78')}

        {/* Good Matches */}
        {renderSection('Good Matches', goodMatches, 'checkmark-circle', '#FF9800')}

        {/* Other Recipes */}
        {renderSection('Other Recipes', otherRecipes, 'book', '#718096')}

        <View style={{ height: TAB_BAR_HEIGHT + 20 }} />
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={28} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {isLoadingDetail ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading recipe...</Text>
              </View>
            ) : selectedRecipe ? (
              <ScrollView 
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Recipe Header */}
                <View style={[styles.modalImagePlaceholder, { backgroundColor: getPlaceholderImage(selectedRecipe.name) }]}>
                  <Icon name="restaurant" size={60} color="rgba(255,255,255,0.9)" />
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                  <Text style={styles.modalTitleNepali}>{selectedRecipe.name_nepali}</Text>

                  <Text style={styles.modalDescription}>{selectedRecipe.description}</Text>

                  {/* Recipe Meta */}
                  <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                      <Icon name="time-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.metaText}>
                        Prep: {selectedRecipe.prep_time_minutes} min
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="flame-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.metaText}>
                        Cook: {selectedRecipe.cook_time_minutes} min
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="people-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.metaText}>
                        Serves: {selectedRecipe.servings}
                      </Text>
                    </View>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(selectedRecipe.difficulty) + '20' }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(selectedRecipe.difficulty) }]}>
                        {selectedRecipe.difficulty}
                      </Text>
                    </View>
                  </View>

                  {/* Ingredients */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Icon name="list-outline" size={24} color={COLORS.primary} />
                      <Text style={styles.detailSectionTitle}>Ingredients</Text>
                    </View>
                    {selectedRecipe.recipe_ingredients.map((item, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <View style={styles.ingredientBullet}>
                          <View style={styles.bulletDot} />
                        </View>
                        <Text style={styles.ingredientItemText}>
                          {item.quantity} {item.ingredient.name}
                          {item.is_essential && (
                            <Text style={styles.essentialTag}> (Essential)</Text>
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Instructions */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Icon name="document-text-outline" size={24} color={COLORS.primary} />
                      <Text style={styles.detailSectionTitle}>Instructions</Text>
                    </View>
                    <Text style={styles.instructionsText}>{selectedRecipe.instructions}</Text>
                  </View>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.text.muted,
    marginBottom: 16,
  },
  ingredientsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ingredientChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recipeTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  recipeNameNepali: {
    fontSize: 14,
    color: COLORS.text.muted,
    fontWeight: '500',
  },
  matchBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  matchPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  missingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  missingText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  recipeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapToView: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: COLORS.background,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 22,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.muted,
    fontWeight: '600',
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  modalTitleNepali: {
    fontSize: 18,
    color: COLORS.text.muted,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailSection: {
    marginBottom: 28,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 8,
  },
  ingredientBullet: {
    paddingTop: 8,
    paddingRight: 12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  ingredientItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  essentialTag: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  instructionsText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
});





       
