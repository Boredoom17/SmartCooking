
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import 'react-native-url-polyfill/auto';

// Initialize Supabase client WITH AsyncStorage for session persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types
export interface Ingredient {
  id: number;
  name: string;
  name_nepali: string;
  image_url: string | null;
  created_at: string;
}

export interface Recipe {
  id: number;
  name: string;
  name_nepali: string;
  description: string;
  instructions: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image_url: string | null;
  created_at: string;
}

export interface RecipeMatch {
  recipe_id: number;
  recipe_name: string;
  recipe_name_nepali: string;
  match_percentage: number;
  missing_ingredients: string[];
}

export interface RecipeDetail extends Recipe {
  recipe_ingredients: Array<{
    quantity: string;
    is_essential: boolean;
    ingredient: Ingredient;
  }>;
}

// API Functions

/**
 * Get all available ingredients from database
 */
export const getAllIngredients = async (): Promise<Ingredient[]> => {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

/**
 * Find recipes that can be made with given ingredients
 * @param ingredientNames - Array of ingredient names detected by YOLO
 */
export const findRecipesByIngredients = async (
  ingredientNames: string[]
): Promise<RecipeMatch[]> => {
  const { data, error } = await supabase
    .rpc('find_recipes_by_ingredients', {
      ingredient_names: ingredientNames,
    });
  
  if (error) throw error;
  return data || [];
};

/**
 * Get detailed information about a specific recipe
 * @param recipeId - Recipe ID
 */
export const getRecipeDetails = async (
  recipeId: number
): Promise<RecipeDetail> => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        quantity,
        is_essential,
        ingredient:ingredients (
          id,
          name,
          name_nepali,
          image_url
        )
      )
    `)
    .eq('id', recipeId)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Get all recipes from database
 */
export const getAllRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

/**
 * Search recipes by name
 * @param searchTerm - Text to search for in recipe names
 */
export const searchRecipes = async (searchTerm: string): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,name_nepali.ilike.%${searchTerm}%`)
    .order('name');
  
  if (error) throw error;
  return data || [];
};
