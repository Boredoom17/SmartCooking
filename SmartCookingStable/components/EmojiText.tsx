// components/EmojiText.tsx
// Use this component whenever you need to display emojis

import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface EmojiTextProps {
  emoji: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

const EmojiText: React.FC<EmojiTextProps> = ({ emoji, size = 24, style }) => {
  return (
    <Text 
      style={[
        { 
          fontSize: size,
          lineHeight: size * 1.2, // Ensures proper vertical alignment
        }, 
        style
      ]}
    >
      {emoji}
    </Text>
  );
};

export default EmojiText;

// ====== COMMON EMOJIS FOR YOUR APP ======
// Copy these into your components as needed:

// FOOD & COOKING
// 🍽️ 🍳 🥘 🍲 🥗 🥙 🌮 🍕 🍔 🍟 🥓 🍗 🍖 🥩
// 🍞 🥖 🥐 🥯 🧀 🥚 🍳 🥞 🧇 🥓

// VEGETABLES
// 🥬 🥦 🥒 🌶️ 🫑 🥕 🧅 🧄 🥔 🍅 🫛

// FRUITS
// 🍎 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍒 🍑 🥭 🍍 🥥 🥝

// COOKING ITEMS
// 👨‍🍳 👩‍🍳 🔪 🥄 🍴 🥢

// UI EMOJIS
// 🏠 📷 📸 👤 ⭐ ❤️ 💚 💙 🔍 ✨ 🌿 🎯

// NEPALI/CULTURAL
// 🙏 🕉️ 🏔️ 🌾