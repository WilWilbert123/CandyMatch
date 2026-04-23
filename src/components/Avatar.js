import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

export default function Avatar({ emoji, name, size = 'medium', onPress, isSelected }) {
  const sizeMap = { small: 40, medium: 60, large: 80 };
  const fontSize = sizeMap[size] / 1.5;
  
  const avatarContent = (
    <LinearGradient 
      colors={isSelected ? [candyTheme.candyYellow, candyTheme.candyOrange] : [candyTheme.candyPink, candyTheme.candyPurple]} 
      style={[styles.avatar, { width: sizeMap[size], height: sizeMap[size], borderRadius: sizeMap[size] / 2 }]}
    >
      <Text style={[styles.emoji, { fontSize }]}>{emoji}</Text>
      {name && size !== 'small' && <Text style={styles.name}>{name}</Text>}
    </LinearGradient>
  );
  
  if (onPress) return <TouchableOpacity onPress={onPress}>{avatarContent}</TouchableOpacity>;
  return avatarContent;
}

const styles = StyleSheet.create({
  avatar: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    margin: spacing.small, 
    shadowColor: candyTheme.shadowColor, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: candyTheme.shadowOpacity, 
    shadowRadius: 5, 
    elevation: 5 
  },
  emoji: { fontWeight: 'bold' },
  name: { fontSize: fontSizes.small, color: candyTheme.textLight, marginTop: spacing.small, fontWeight: 'bold' },
});