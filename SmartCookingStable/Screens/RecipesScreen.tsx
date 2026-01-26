import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';

type RecipesRouteProp = RouteProp<{ Recipes: { ingredients: string[] } }, 'Recipes'>;

export default function RecipesScreen() {
  const route = useRoute<RecipesRouteProp>();
  const { ingredients } = route.params || { ingredients: [] };

  const recipes = [
    { id: '1', name: 'Veggie Stir Fry', image: 'https://example.com/stirfry.jpg', time: '20 min', difficulty: 'Easy' },
    { id: '2', name: 'Potato Cheese Bake', image: 'https://example.com/bake.jpg', time: '45 min', difficulty: 'Medium' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Recipes for Your Ingredients</Text>
      <Text style={styles.subtitle}>Based on: {ingredients.join(', ') || 'No ingredients'}</Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.recipeCard}>
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName}>{item.name}</Text>
              <Text style={styles.recipeDetails}>{item.time} • {item.difficulty}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#695a44', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#444', marginBottom: 24 },
  recipeCard: { backgroundColor: '#f9f9f9', borderRadius: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', padding: 12 },
  recipeImage: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
  recipeInfo: { flex: 1 },
  recipeName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  recipeDetails: { fontSize: 14, color: '#666', marginTop: 4 },
});