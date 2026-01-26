import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface RecommendedCardProps {
  id: string;
  name: string;
  image: string;
  time: string;
  health: string;
}

export default function RecommendedCard({ name, image, time, health }: RecommendedCardProps) {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.footer}>
          <Text style={styles.time}>{time}</Text>
          <View style={[styles.badge, health === 'High' ? styles.high : styles.medium]}>
            <Text style={styles.badgeText}>{health}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  image: { width: '100%', height: 140 },
  info: { padding: 12 },
  name: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 14, color: '#666' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  high: { backgroundColor: '#8BC34A' },
  medium: { backgroundColor: '#FF9800' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});