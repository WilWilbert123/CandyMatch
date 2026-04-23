import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { candyTheme, fontSizes } from '../styles/theme';

export default function LoadingScreen() {
  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <ActivityIndicator size="large" color={candyTheme.textLight} />
      <Text style={styles.text}>Loading Candy Match...</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 20, fontSize: fontSizes.body, color: candyTheme.textLight },
});