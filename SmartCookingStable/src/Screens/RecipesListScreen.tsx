import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RecipeMatch } from '../api/supabase';
import { TAB_BAR_HEIGHT } from '../constants';

type RecipesListRouteProp = RouteProp<{
  RecipesList: {
    matchedRecipes: RecipeMatch[];
    detectedIngredients: string[];
  };
}, 'RecipesList'>;

const RecipesListScreen = () => {
  const route = useRoute<RecipesListRouteProp>();
const navigation = useNavigation<any>();
  
  const { matchedRecipes = [], detectedIngredients = [] } = route.params || {};

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#48BB78';
      case 'Medium': return '#ED8936';
      case 'Hard': return '#E53E3E';
      default: return '#718096';
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return '#48BB78';
    if (percentage >= 60) return '#ED8936';
    return '#E53E3E';
  };

  const handleRecipePress = (recipeId: number) => {
    // Navigate to Recipe Detail Screen
    navigation.navigate('RecipeDetail' as never, { 
      recipeId,
      detectedIngredients 
    } as never);
  };

  if (matchedRecipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="food-off" size={80} color="#CBD5E0" />
          <Text style={styles.emptyTitle}>No Recipes Found</Text>
          <Text style={styles.emptySubtitle}>
            No recipes match your ingredients. Try scanning more items.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#1A202C" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {matchedRecipes.length} Recipe{matchedRecipes.length > 1 ? 's' : ''} Found
          </Text>
          <View style={styles.ingredientsBadge}>
            <Icon name="food-apple" size={14} color="#718096" />
            <Text style={styles.ingredientsBadgeText}>
              {detectedIngredients.length} ingredients
            </Text>
          </View>
        </View>
      </View>

      {/* Recipe List - Vertical Scroll */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recipesGrid}>
          {matchedRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.recipe_id}
              style={styles.recipeCard}
              onPress={() => handleRecipePress(recipe.recipe_id)}
              activeOpacity={0.8}
            >
              {/* Recipe Image Placeholder */}
              <View style={styles.recipeImageContainer}>
                <View style={styles.recipeImagePlaceholder}>
                  <Icon name="chef-hat" size={40} color="#CBD5E0" />
                </View>
                
                {/* Match Badge - Top Right */}
                <View style={[
                  styles.matchBadge,
                  { backgroundColor: getMatchColor(recipe.match_percentage) }
                ]}>
                  <Text style={styles.matchText}>{recipe.match_percentage}%</Text>
                </View>
              </View>

              {/* Recipe Info */}
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName} numberOfLines={1}>
                  {recipe.recipe_name}
                </Text>
                <Text style={styles.recipeNameNepali} numberOfLines={1}>
                  {recipe.recipe_name_nepali}
                </Text>

                {/* Missing Ingredients */}
                {recipe.missing_ingredients.length > 0 ? (
                  <View style={styles.missingContainer}>
                    <Icon name="alert-circle-outline" size={14} color="#E53E3E" />
                    <Text style={styles.missingText} numberOfLines={1}>
                      Missing: {recipe.missing_ingredients.slice(0, 2).join(', ')}
                      {recipe.missing_ingredients.length > 2 ? '...' : ''}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.completeContainer}>
                    <Icon name="check-circle" size={14} color="#48BB78" />
                    <Text style={styles.completeText}>All ingredients available</Text>
                  </View>
                )}

                {/* View Recipe Button */}
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => handleRecipePress(recipe.recipe_id)}
                >
                  <Text style={styles.viewButtonText}>View Recipe</Text>
                  <Icon name="arrow-right" size={16} color="#FDB813" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButtonHeader: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  ingredientsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EDF2F7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  ingredientsBadgeText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#FDB813',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },

  // Recipe Grid - Vertical
  recipesGrid: {
    padding: 16,
    gap: 16,
  },

  // Recipe Card - Similar to HomePage but Vertical
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  recipeImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Recipe Info
  recipeInfo: {
    padding: 16,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  recipeNameNepali: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 12,
  },

  // Missing/Complete Ingredients
  missingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  missingText: {
    fontSize: 13,
    color: '#E53E3E',
    flex: 1,
  },
  completeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  completeText: {
    fontSize: 13,
    color: '#48BB78',
    fontWeight: '500',
  },

  // View Recipe Button
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FDB813',
    gap: 6,
  },
  viewButtonText: {
    color: '#FDB813',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RecipesListScreen;