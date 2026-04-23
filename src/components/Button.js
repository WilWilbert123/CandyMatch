import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { candyTheme, spacing } from '../styles/theme';

export default function Button({ title, onPress, loading = false, variant = 'primary', disabled = false }) {
  const backgroundColor = variant === 'primary' ? candyTheme.buttonPrimary : candyTheme.buttonSecondary;
  const opacity = disabled ? 0.5 : 1;

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor, opacity }]} 
      onPress={onPress} 
      disabled={loading || disabled} 
      activeOpacity={0.7}
    >
      {loading ? <ActivityIndicator color={candyTheme.textLight} /> : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { 
    paddingVertical: spacing.medium, 
    paddingHorizontal: spacing.xlarge, 
    borderRadius: 25, 
    marginVertical: spacing.small, 
    shadowColor: candyTheme.shadowColor, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: candyTheme.shadowOpacity, 
    shadowRadius: 5, 
    elevation: 5 
  },
  buttonText: { 
    color: candyTheme.textLight, 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
});