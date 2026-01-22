import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  FlatList 
} from 'react-native';

const categories = [
  { id: '1', name: 'Veggies', emoji: '🥦' },
  { id: '2', name: 'Snacks', emoji: '🥜' },
  { id: '3', name: 'Meals', emoji: '🍲' },
  { id: '4', name: 'Fruits', emoji: '🍎' },
  { id: '5', name: 'Drinks', emoji: '🥤' },
  { id: '6', name: 'Low Carb', emoji: '🥑' },
];

const recommendedItems = [
  { id: '1', title: 'Brods Veggie Chips', image: 'https://images.unsplash.com/photo-1621939517172-57a02b2a3d9a?w=400', health: 'Very Healthy', rating: '4.8' },
  { id: '2', title: 'Quinoa Buddha Bowl', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', health: 'Balanced', rating: '4.7' },
  { id: '3', title: 'Avocado Toast', image: 'https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=400', health: 'Heart Healthy', rating: '4.6' },
  { id: '4', title: 'Green Smoothie', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', health: 'Detox', rating: '4.9' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header / Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Food Explorer! 🌿</Text>
        <Text style={styles.subGreeting}>What healthy meal today?</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes, snacks, ingredients..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Categories – horizontal chips */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryChip}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommended */}
      <View style={styles.recommendedSection}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        
        <FlatList
          data={recommendedItems}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.healthBadge}>{item.health}</Text>
                  <Text style={styles.rating}>★ {item.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bottom padding for tab bar */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#695a44',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#695a44',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  recommendedSection: {
    paddingHorizontal: 20,
  },
  card: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthBadge: {
    fontSize: 13,
    color: '#27ae60',
    fontWeight: '600',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
  },
});