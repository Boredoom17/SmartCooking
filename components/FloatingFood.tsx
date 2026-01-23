import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  emoji: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export default function FloatingFood({ emoji, top, left, right, bottom }: Props) {
  return (
    <View style={[styles.circle, { top, left, right, bottom }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  emoji: {
    fontSize: 38,
  },
});