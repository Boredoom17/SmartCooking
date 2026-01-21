import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Button,
} from 'react-native';
// Make sure you use the icon set that matches your other components
import Icon from 'react-native-vector-icons/Feather';

const HomePage = () => {
  // 1. Define the state for the search query
  const [query, setQuery] = useState('');

  return (
    <View>
      <Text style={styles.titleText}>
        What would you{'\n'} like to cook today?
      </Text>
      <View style={styles.container}>
        {/* Search Input Box */}
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search for healthy food..."
            placeholderTextColor="#A0A0A0"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {/* Only show 'X' button if there is text */}
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="x-circle" size={18} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.Categories}>
          <TouchableOpacity
            style={styles.CategoryButton}
            onPress={() => console.log('Icon Pressed!')}
            activeOpacity={0.7}
          >
            <Icon name="shopping-cart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.CategoryButton}
            onPress={() => console.log('Icon Pressed!')}
            activeOpacity={0.7}
          >
            <Icon name="shopping-cart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.CategoryButton}
            onPress={() => console.log('Icon Pressed!')}
            activeOpacity={0.7}
          >
            <Icon name="shopping-cart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.CategoryButton}
            onPress={() => console.log('Icon Pressed!')}
            activeOpacity={0.7}
          >
            <Icon name="shopping-cart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Button - Dark Theme */}
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
          <Icon name="sliders" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '100%',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 55,
    borderRadius: 16,
    paddingHorizontal: 15,
    // Premium soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    // Added height for Android visibility
    height: '100%',
  },
  filterButton: {
    backgroundColor: '#1A1A1A',
    width: 55,
    height: 55,
    borderRadius: 16,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    // textAlign: 'center',
    lineHeight: 26,
  },
  Categories: {
    display: 'flex',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  CategoryButton: {
    backgroundColor: '#f0f0f0', // light gray background
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5, // optional spacing between buttons
  },
});

export default HomePage;
