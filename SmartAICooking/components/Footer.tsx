import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const WavyHighlightFooter = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Home');

  // The wavy path matching your image
  const wavePath =
    'M0,40 C100,0 150,80 200,40 C250,0 300,80 400,40 L400,150 L0,150 Z';

  const tabs = [
    { name: 'Home', icon: 'home' },
    { name: 'Search', icon: 'search' },
    { name: 'Scan', icon: 'maximize' },
  ];

  return (
    <View style={[styles.container, { height: 100 + insets.bottom }]}>
      {/* Wavy Background stays Green */}
      <Svg
        height={120 + insets.bottom}
        width={width}
        viewBox="0 0 400 120"
        style={styles.svg}
      >
        <Path d={wavePath} fill="#C1E1A6" />
      </Svg>

      <View style={[styles.content, { paddingBottom: insets.bottom + 10 }]}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => setActiveTab(tab.name)}
            >
              <View
                style={[
                  styles.iconCircle,
                  isActive ? styles.activeCircle : styles.inactiveCircle,
                ]}
              >
                <Icon
                  name={tab.icon}
                  size={22}
                  color={isActive ? '#FFFFFF' : '#333'}
                />
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  svg: {
    position: 'absolute',
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    height: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  // This makes the ACTIVE icon background DARK
  activeCircle: {
    backgroundColor: '#1A1A1A',
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Inactive icons remain transparent or light
  inactiveCircle: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  label: {
    fontSize: 10,
    color: '#333',
    marginTop: 4,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: 'bold',
    color: '#000',
  },
});

export default WavyHighlightFooter;
