// Import the supabase client from root directory
import { supabase } from '../../supabaseClient';

// Type definitions
export interface RecipeIngredient {
  quantity: string;
  is_essential: boolean;
  ingredient: {
    name: string;
  };
}

export interface RecipeDetail {
  id: number;
  name: string;
  name_nepali: string | null;
  description: string | null;
  image_url: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: string;
  instructions: string | null;
  recipe_ingredients: RecipeIngredient[];
}

export interface RecipeMatch {
  recipe_id: number;
  recipe_name: string;
  match_percentage: number;
  image_url?: string | null;
}

/**
 * Get detailed recipe information including ingredients
 * @param recipeId - The ID of the recipe to fetch
 * @returns Promise<RecipeDetail>
 */
export const getRecipeDetails = async (recipeId: number): Promise<RecipeDetail> => {
  try {
    console.log('📖 Fetching recipe details for ID:', recipeId);

    // 1️⃣ Fetch recipe basic info
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (recipeError) {
      console.error('❌ Error fetching recipe:', recipeError);
      throw new Error(`Failed to fetch recipe: ${recipeError.message}`);
    }

    if (!recipeData) {
      throw new Error('Recipe not found');
    }

    console.log('✅ Recipe fetched:', recipeData.name);

    // 2️⃣ Fetch recipe ingredients
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select(`
        quantity,
        is_essential,
        ingredient_name
      `)
      .eq('recipe_id', recipeId);

    if (ingredientsError) {
      console.error('⚠️ Error fetching ingredients:', ingredientsError);
      console.warn('Continuing without ingredients');
    }

    console.log('📦 Ingredients fetched:', ingredientsData?.length || 0);

    // 3️⃣ Map ingredients to expected format
    const recipeIngredients: RecipeIngredient[] = (ingredientsData || []).map(
      (item: any) => ({
        quantity: item.quantity || '',
        is_essential: item.is_essential ?? false,
        ingredient: {
          name: item.ingredient_name || 'Unknown ingredient',
        },
      })
    );

    // 4️⃣ Return formatted recipe detail
    return {
      id: recipeData.id,
      name: recipeData.name || 'Unnamed Recipe',
      name_nepali: recipeData.name_nepali || null,
      description: recipeData.description || null,
      image_url: recipeData.image_url || null,
      prep_time_minutes: recipeData.prep_time_minutes || 0,
      cook_time_minutes: recipeData.cook_time_minutes || 0,
      servings: recipeData.servings || 1,
      difficulty: recipeData.difficulty || 'Medium',
      instructions: recipeData.instructions || null,
      recipe_ingredients: recipeIngredients,
    };
  } catch (error: any) {
    console.error('❌ getRecipeDetails error:', error);
    throw error;
  }
};

/**
 * Find recipes that match given ingredients
 * @param ingredients - Array of ingredient names to match
 * @returns Promise<RecipeMatch[]>
 */
export const findRecipesByIngredients = async (
  ingredients: string[]
): Promise<RecipeMatch[]> => {
  try {
    console.log('🔍 Starting recipe search...');
    console.log('📝 Ingredients to search:', ingredients);

    if (!ingredients || ingredients.length === 0) {
      console.log('⚠️ No ingredients provided');
      return [];
    }

    // Clean and normalize ingredients
    const normalizedIngredients = ingredients
      .map(ing => ing.trim().toLowerCase())
      .filter(ing => ing.length > 0);

    if (normalizedIngredients.length === 0) {
      console.log('⚠️ No valid ingredients after normalization');
      return [];
    }

    console.log('✅ Normalized ingredients:', normalizedIngredients);
    console.log('🔄 Trying RPC function: find_recipes_by_ingredients...');

    // Try using RPC function first (with timeout)
    const rpcPromise = supabase.rpc('find_recipes_by_ingredients', {
      ingredient_names: normalizedIngredients,
    });

    // Add timeout to RPC call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('RPC timeout after 10 seconds')), 10000);
    });

    let data, error;
    try {
      const result = await Promise.race([rpcPromise, timeoutPromise]);
      data = (result as any).data;
      error = (result as any).error;
    } catch (timeoutError: any) {
      console.error('⏰ RPC function timeout:', timeoutError.message);
      console.log('🔄 Falling back to simple search...');
      return await findRecipesByIngredientsSimple(normalizedIngredients);
    }

    if (error) {
      console.error('❌ RPC error:', error);
      console.log('🔄 Falling back to simple search...');
      return await findRecipesByIngredientsSimple(normalizedIngredients);
    }

    console.log('✅ RPC function succeeded, processing results...');

    // Map to RecipeMatch format
    const matches: RecipeMatch[] = (data || []).map((item: any) => ({
      recipe_id: item.recipe_id || item.id,
      recipe_name: item.recipe_name || item.name || 'Unknown Recipe',
      match_percentage: Math.round(item.match_percentage || 0),
      image_url: item.image_url || null,
    }));

    // Sort by match percentage (highest first)
    matches.sort((a, b) => b.match_percentage - a.match_percentage);

    console.log(`✅ Found ${matches.length} matching recipes`);
    return matches;
  } catch (error: any) {
    console.error('❌ findRecipesByIngredients error:', error);
    throw error;
  }
};

/**
 * Fallback: Simple recipe search if RPC function doesn't exist
 */
export const findRecipesByIngredientsSimple = async (
  ingredients: string[]
): Promise<RecipeMatch[]> => {
  try {
    console.log('🔍 Simple search: Fetching all recipes...');

    // Fetch all recipes with timeout
    const recipesPromise = supabase
      .from('recipes')
      .select('id, name, image_url')
      .limit(50); // Limit to 50 recipes for performance

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Recipes fetch timeout')), 10000);
    });

    const result = await Promise.race([recipesPromise, timeoutPromise]);
    const { data: recipes, error: recipesError } = result as any;

    if (recipesError) {
      throw new Error(`Failed to fetch recipes: ${recipesError.message}`);
    }

    if (!recipes || recipes.length === 0) {
      console.log('⚠️ No recipes found in database');
      return [];
    }

    console.log(`📦 Fetched ${recipes.length} recipes, calculating matches...`);

    // For each recipe, calculate match percentage
    const matches: RecipeMatch[] = [];
    let processed = 0;

    for (const recipe of recipes) {
      processed++;
      if (processed % 10 === 0) {
        console.log(`⏳ Processing... ${processed}/${recipes.length}`);
      }

      // Fetch ingredients for this recipe
      const { data: recipeIngredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select('ingredient_name')
        .eq('recipe_id', recipe.id);

      if (ingredientsError) {
        console.warn(`⚠️ Failed to fetch ingredients for recipe ${recipe.id}`);
        continue;
      }

      // Calculate match
      const recipeIngredientNames = (recipeIngredients || []).map(
        (item: any) => item.ingredient_name?.toLowerCase() || ''
      );

      const matchCount = ingredients.filter(ing =>
        recipeIngredientNames.some((recipeIng: string) =>
          recipeIng.includes(ing.toLowerCase()) || ing.toLowerCase().includes(recipeIng)
        )
      ).length;

      if (matchCount > 0) {
        const matchPercentage = Math.round(
          (matchCount / recipeIngredientNames.length) * 100
        );

        matches.push({
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          match_percentage: matchPercentage,
          image_url: recipe.image_url,
        });
      }
    }

    // Sort by match percentage
    matches.sort((a, b) => b.match_percentage - a.match_percentage);

    console.log(`✅ Simple search complete: ${matches.length} matches found`);
    return matches.slice(0, 20); // Return top 20 matches
  } catch (error: any) {
    console.error('❌ findRecipesByIngredientsSimple error:', error);
    throw error;
  }
};

// Re-export supabase for convenience
export { supabase };