import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { candyTheme, spacing } from '../styles/theme';
const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Spin animation for candy
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -15, 0],
  });

  return (
    <LinearGradient
      colors={[candyTheme.gradientStart, candyTheme.gradientEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Enhanced Decorative Background Elements */}
      <View style={[styles.bubble, styles.bubble1]} />
      <View style={[styles.bubble, styles.bubble2]} />
      <View style={[styles.bubble, styles.bubble3]} />
      <View style={[styles.bubble, styles.bubble4]} />
      <View style={[styles.bubble, styles.bubble5]} />
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.particle,
            {
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: 4 + Math.random() * 8,
              height: 4 + Math.random() * 8,
              opacity: 0.1 + Math.random() * 0.2,
              animationDuration: `${3 + Math.random() * 4}s`,
            },
          ]}
        />
      ))}

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          
          {/* Enhanced Header Section */}
          <View style={styles.header}>
            <Animated.View style={{ transform: [{ translateY: bounce }] }}>
              <Text style={styles.title}>
                CANDY
                <Text style={styles.titleAccent}> MATCH</Text>
              </Text>
            </Animated.View>
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={['#FFD93D', '#FF9D3D']}
                style={styles.badgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.subtitle}>SWEET ADVENTURE</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Enhanced Hero Visual */}
          <View style={styles.heroContainer}>
            <Animated.View style={[styles.emojiCircle, { transform: [{ rotate: spin }] }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
                style={styles.circleGradient}
              >
                <Text style={styles.mainEmoji}>🍬</Text>
              </LinearGradient>
            </Animated.View>
            
            {/* Animated emoji cards */}
            <View style={styles.emojiRow}>
              {[
                { emoji: '🐶', color: '#FF6B6B', delay: 0 },
                { emoji: '🐱', color: '#4ECDC4', delay: 100 },
                { emoji: '🐭', color: '#FFE66D', delay: 200 },
                { emoji: '🐹', color: '#FF9F4A', delay: 300 },
              ].map((item, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.miniEmojiCard,
                    {
                      backgroundColor: item.color,
                      transform: [{ translateY: bounce }],
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  <Text style={styles.emojiText}>{item.emoji}</Text>
                </Animated.View>
              ))}
            </View>
            
            {/* Decorative text */}
            <Text style={styles.tagline}>Match 3 & Win Prizes!</Text>
          </View>

          {/* Enhanced Action Area */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('LevelSelect')}
            >
              <Animated.View style={[styles.buttonShadow, { transform: [{ scale: scaleAnim }] }]}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53', '#FFD93D']}
                  style={styles.mainButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.playButtonText}>PLAY GAME</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('HighScores')}
            >
              <LinearGradient
                colors={['transparent', 'transparent']}
                style={styles.secondaryGradient}
              >
                <Text style={styles.secondaryButtonText}>HIGH SCORES</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: Platform.OS === 'ios' ? spacing.xlarge : spacing.large },
  header: { alignItems: 'center', marginTop: Platform.OS === 'ios' ? 20 : 40 },
  title: { fontSize: 52, fontWeight: '900', color: '#FFF', letterSpacing: -1, textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12 },
  titleAccent: { color: '#FFD93D' },
  badgeContainer: { marginTop: 12, borderRadius: 25, overflow: 'hidden', shadowColor: '#FFD93D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  badgeGradient: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 25 },
  subtitle: { fontSize: 14, fontWeight: '800', color: '#5C3D2E', letterSpacing: 1 },
  heroContainer: { alignItems: 'center', width: '100%' },
  emojiCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 30, shadowColor: '#FFD93D', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },
  circleGradient: { width: '100%', height: '100%', borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  mainEmoji: { fontSize: 72 },
  emojiRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  miniEmojiCard: { padding: 12, borderRadius: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  emojiText: { fontSize: 28 },
  tagline: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5, marginTop: 8 },
  footer: { width: '100%', paddingHorizontal: 32, paddingBottom: Platform.OS === 'ios' ? 20 : 10 },
  buttonShadow: { shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12 },
  mainButton: { borderRadius: 35, height: 70, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#D36B00' },
  playButtonText: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 1.5 },
  secondaryButton: { marginTop: 24, alignItems: 'center', borderRadius: 25, overflow: 'hidden' },
  secondaryGradient: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 },
  secondaryButtonText: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  bubble: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.15)' },
  bubble1: { top: '5%', left: '-10%', width: 120, height: 120, opacity: 0.3 },
  bubble2: { bottom: '20%', right: '-5%', width: 180, height: 180, opacity: 0.15 },
  bubble3: { top: '30%', right: '15%', width: 60, height: 60, opacity: 0.2 },
  bubble4: { bottom: '40%', left: '5%', width: 80, height: 80, opacity: 0.1 },
  bubble5: { top: '60%', left: '20%', width: 40, height: 40, opacity: 0.25 },
  particle: { position: 'absolute', borderRadius: 10, backgroundColor: '#FFF' },
});