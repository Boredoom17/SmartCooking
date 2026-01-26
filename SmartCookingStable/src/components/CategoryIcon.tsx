import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  title: string;
  onMenuPress?: () => void;
  onInfoPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuPress, onInfoPress }) => {
  return (
    <View>
      {/* Left: Menu Icon (only if title !== "Home") */}
      {title === 'Home' ? (
        <View style={styles.iconButton} />
      ) : (
        <View style={(styles.headerContainer, styles.safeArea)}>
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
            <Icon name="menu" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerText} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <TouchableOpacity onPress={onInfoPress} style={styles.iconButton}>
            <Icon name="info-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Center: Variable Title */}

      {/* Right: Info Icon */}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#007AFF',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 4,
  },
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
