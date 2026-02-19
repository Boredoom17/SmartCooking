import { RecipeMatch } from '../api/supabase';

export type RootStackParamList = {
  MainTabs: undefined;
  RecipesList: {
    matchedRecipes: RecipeMatch[];
    detectedIngredients: string[];
  };
  RecipeDetail: {
    recipeId: number;
    detectedIngredients?: string[];
  };
};

// Bottom Tab Navigator
export type TabParamList = {
  Home: undefined;
  Scan: undefined;
  Profile: undefined;
};

// Usage in screens:
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../types/navigation';
// 
// type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
// const navigation = useNavigation<NavigationProp>();
