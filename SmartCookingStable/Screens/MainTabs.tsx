import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from './HomeScreen';
import ScanScreen from './ScanScreen';
import ProfileScreen from './ProfileScreen';
const Tab = createBottomTabNavigator();

// Export this constant so all screens can use it
import { TAB_BAR_HEIGHT } from './constants';

function CustomTabBar({ state, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const iconName =
          route.name === 'Home' ? 'home' :
          route.name === 'Scan' ? 'camera' :
          'account-circle';

        const onPress = () => {
          navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              route.name === 'Scan' && styles.scanButton,
              isFocused && styles.focusedItem,
            ]}
            activeOpacity={0.75}
          >
            <Icon
              name={iconName}
              size={route.name === 'Scan' ? 36 : 26}
              color={isFocused ? '#FDB813' : '#777'}
            />
            {route.name !== 'Scan' && (
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && { color: '#FDB813' },
                ]}
              >
                {route.name}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: TAB_BAR_HEIGHT,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    height: TAB_BAR_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: '#FDB813',
    borderRadius: 50,
    width: 80,
    height: 80,
    marginTop: -40,
    elevation: 10,
  },
  focusedItem: {
    transform: [{ scale: 1.08 }],
  },
  tabLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    fontWeight: '500',
  },
});