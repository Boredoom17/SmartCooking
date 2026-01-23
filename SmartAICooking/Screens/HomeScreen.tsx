import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const categories = [
  { id: '1', name: 'Veggies', emoji: '🥦' },
  { id: '2', name: 'Snacks', emoji: '🥜' },
  { id: '3', name: 'Meals', emoji: '🍲' },
  { id: '4', name: 'Fruits', emoji: '🍎' },
  { id: '5', name: 'Drinks', emoji: '🥤' },
];

const nepaliRecipes = [
  {
    id: '1',
     name: 'Fresh Green Salad with Avocado and Cherry Tomatoes',
    image: 'https://images.pexels.com/photos/34337146/pexels-photo-34337146.jpeg',
    time: '25 min',
    health: 'High',
  },
  {
    id: '2',
    name: 'Chicken Momo',
    image: 'https://images.pexels.com/photos/28445593/pexels-photo-28445593.jpeg',
    time: '40 min',
    health: 'Medium',
  },
  {
    id: '3',
    name: 'Veg Sandwich',
    image: 'https://images.pexels.com/photos/28681955/pexels-photo-28681955.jpeg',
    time: '50 min',
    health: 'High',
  },
  {
    id: '4',
    name: 'Veg Chow Mein',
    image: 'https://images.pexels.com/photos/7138913/pexels-photo-7138913.jpeg',
    time: '30 min',
    health: 'Medium',
  },
  {
    id: '5',
    name: 'Samosa',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
    time: '20 min',
    health: 'Medium',
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top section – Foodvisor style */}
      <View style={styles.topBar}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Namaste 🌿</Text>
          <Text style={styles.subGreeting}>Let's discover different Nepali flavors today</Text>
        </View>
        <TouchableOpacity style={styles.notificationIcon}>
          <Icon name="bell-outline" size={28} color="#695a44" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes, ingredients..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Categories – horizontal scroll */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryChip}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommended Nepali Recipes – horizontal carousel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Recipes</Text>
        <FlatList
          data={nepaliRecipes}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recipeCard}>
              <Image source={{ uri: item.image }} style={styles.recipeImage} />
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <View style={styles.recipeFooter}>
                  <Text style={styles.recipeTime}>{item.time}</Text>
                  <View style={[styles.healthBadge, item.health === 'Very High' ? styles.veryHigh : item.health === 'High' ? styles.high : styles.medium]}>
                    <Text style={styles.healthText}>{item.health}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bottom padding for tab bar */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
  },
  greetingSection: { flex: 1 },
  greeting: { fontSize: 26, fontWeight: '700', color: '#695a44' },
  subGreeting: { fontSize: 16, color: '#666', marginTop: 4 },
  notificationIcon: { padding: 8 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 14 },
  section: { marginBottom: 32, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#695a44', marginBottom: 16 },
  categoryChip: {
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryEmoji: { fontSize: 32 },
  categoryName: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 6 },
  recipeCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recipeImage: { width: '100%', height: 140, resizeMode: 'cover' },
  recipeInfo: { padding: 12 },
  recipeName: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 6 },
  recipeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recipeTime: { fontSize: 14, color: '#666' },
  healthBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  veryHigh: { backgroundColor: '#4CAF50' },
  high: { backgroundColor: '#8BC34A' },
  medium: { backgroundColor: '#FF9800' },
  healthText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});