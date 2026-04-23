import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

// Import your storage functions
import {
    getLevelProgress,
    getTotalStarsEarned,
    getUnlockedLevels
} from '../utils/storage'; // Adjust path as needed

const ALL_CANDIES = [
  // Level 1-10 (Common)
  { id: 1, name: 'Gummy Bear', emoji: '🍬', unlockedByLevel: 1, rarity: 'common', color: ['#FF6B6B', '#FF8E8E'] },
  { id: 2, name: 'Lollipop', emoji: '🍭', unlockedByLevel: 2, rarity: 'common', color: ['#FFB347', '#FFCC80'] },
  { id: 3, name: 'Chocolate Bar', emoji: '🍫', unlockedByLevel: 3, rarity: 'common', color: ['#8B4513', '#A0522D'] },
  { id: 4, name: 'Cookie', emoji: '🍪', unlockedByLevel: 4, rarity: 'common', color: ['#D2691E', '#DEB887'] },
  { id: 5, name: 'Candy Cane', emoji: '🍬', unlockedByLevel: 5, rarity: 'common', color: ['#FF4444', '#FF6666'] },
  { id: 6, name: 'Jelly Bean', emoji: '🫘', unlockedByLevel: 6, rarity: 'common', color: ['#FF69B4', '#FFB6C1'] },
  { id: 7, name: 'Caramel', emoji: '🍮', unlockedByLevel: 7, rarity: 'common', color: ['#DAA520', '#F0E68C'] },
  { id: 8, name: 'Marshmallow', emoji: '🍡', unlockedByLevel: 8, rarity: 'common', color: ['#FFB7C5', '#FFD1DC'] },
  { id: 9, name: 'Licorice', emoji: '🪢', unlockedByLevel: 9, rarity: 'common', color: ['#2B2B2B', '#4A4A4A'] },
  { id: 10, name: 'Toffee', emoji: '🍯', unlockedByLevel: 10, rarity: 'common', color: ['#CD853F', '#D2691E'] },
  
  // Level 11-20 (Common)
  { id: 11, name: 'Mint Candy', emoji: '🍃', unlockedByLevel: 11, rarity: 'common', color: ['#98FB98', '#00FA9A'] },
  { id: 12, name: 'Butterscotch', emoji: '🍬', unlockedByLevel: 12, rarity: 'common', color: ['#FFD700', '#FFA500'] },
  { id: 13, name: 'Taffy', emoji: '🍬', unlockedByLevel: 13, rarity: 'common', color: ['#FF69B4', '#FF1493'] },
  { id: 14, name: 'Pez', emoji: '📦', unlockedByLevel: 14, rarity: 'common', color: ['#FF4500', '#FF6347'] },
  { id: 15, name: 'Skittles', emoji: '🌈', unlockedByLevel: 15, rarity: 'common', color: ['#FF0000', '#FF7F00', '#FFFF00'] },
  { id: 16, name: 'Starburst', emoji: '⭐', unlockedByLevel: 16, rarity: 'common', color: ['#FF1493', '#FF69B4'] },
  { id: 17, name: 'Twizzlers', emoji: '🍬', unlockedByLevel: 17, rarity: 'common', color: ['#DC143C', '#FF4444'] },
  { id: 18, name: 'Hershey Kiss', emoji: '💋', unlockedByLevel: 18, rarity: 'common', color: ['#8B4513', '#A0522D'] },
  { id: 19, name: 'Reeses Cup', emoji: '🥜', unlockedByLevel: 19, rarity: 'common', color: ['#DAA520', '#FFD700'] },
  { id: 20, name: 'M&Ms', emoji: '🔴', unlockedByLevel: 20, rarity: 'common', color: ['#FF0000', '#00FF00', '#0000FF'] },
  
  // Level 21-30 (Rare)
  { id: 21, name: 'Candy Corn', emoji: '🌽', unlockedByLevel: 21, rarity: 'rare', color: ['#FFD700', '#FFA500', '#FF6347'] },
  { id: 22, name: 'Rock Candy', emoji: '🔮', unlockedByLevel: 22, rarity: 'rare', color: ['#E6E6FA', '#D8BFD8'] },
  { id: 23, name: 'Cotton Candy', emoji: '☁️', unlockedByLevel: 23, rarity: 'rare', color: ['#FFB6C1', '#FFC0CB'] },
  { id: 24, name: 'Gumdrop', emoji: '🍬', unlockedByLevel: 24, rarity: 'rare', color: ['#7B68EE', '#9370DB'] },
  { id: 25, name: 'Smarties', emoji: '💊', unlockedByLevel: 25, rarity: 'rare', color: ['#FF6347', '#FF7F50'] },
  { id: 26, name: 'Nerds', emoji: '🤓', unlockedByLevel: 26, rarity: 'rare', color: ['#FF1493', '#FF69B4'] },
  { id: 27, name: 'Pop Rocks', emoji: '💥', unlockedByLevel: 27, rarity: 'rare', color: ['#00CED1', '#20B2AA'] },
  { id: 28, name: 'Now & Later', emoji: '⏰', unlockedByLevel: 28, rarity: 'rare', color: ['#FFD700', '#FFA500'] },
  { id: 29, name: 'Sweet Tarts', emoji: '🍬', unlockedByLevel: 29, rarity: 'rare', color: ['#9370DB', '#8A2BE2'] },
  { id: 30, name: 'Bubble Gum', emoji: '🫧', unlockedByLevel: 30, rarity: 'rare', color: ['#FF69B4', '#FFB6C1'] },
  
  // Level 31-40 (Rare)
  { id: 31, name: 'Peppermint', emoji: '🍬', unlockedByLevel: 31, rarity: 'rare', color: ['#FF0000', '#FFFFFF'] },
  { id: 32, name: 'Werthers', emoji: '🍬', unlockedByLevel: 32, rarity: 'rare', color: ['#DAA520', '#B8860B'] },
  { id: 33, name: 'Rolos', emoji: '🍬', unlockedByLevel: 33, rarity: 'rare', color: ['#8B4513', '#D2691E'] },
  { id: 34, name: 'Milky Way', emoji: '🌌', unlockedByLevel: 34, rarity: 'rare', color: ['#2B2B2B', '#4A4A4A'] },
  { id: 35, name: 'Snickers', emoji: '🍫', unlockedByLevel: 35, rarity: 'rare', color: ['#8B4513', '#A0522D'] },
  { id: 36, name: 'Twix', emoji: '🍫', unlockedByLevel: 36, rarity: 'rare', color: ['#FFD700', '#FFA500'] },
  { id: 37, name: 'Kit Kat', emoji: '🍫', unlockedByLevel: 37, rarity: 'rare', color: ['#FF0000', '#FF4444'] },
  { id: 38, name: 'Crunch Bar', emoji: '🍫', unlockedByLevel: 38, rarity: 'rare', color: ['#8B4513', '#CD853F'] },
  { id: 39, name: 'Butterfinger', emoji: '🍫', unlockedByLevel: 39, rarity: 'rare', color: ['#FF4500', '#FF6347'] },
  { id: 40, name: 'Almond Joy', emoji: '🥥', unlockedByLevel: 40, rarity: 'rare', color: ['#8B4513', '#DEB887'] },
  
  // Level 41-45 (Epic)
  { id: 41, name: 'Mint', emoji: '🌿', unlockedByLevel: 41, rarity: 'epic', color: ['#00CED1', '#40E0D0'] },
  { id: 42, name: 'Dragon Candy', emoji: '🐉', unlockedByLevel: 42, rarity: 'epic', color: ['#FF4500', '#FF6347', '#FFD700'] },
  { id: 43, name: 'Star Candy', emoji: '⭐', unlockedByLevel: 43, rarity: 'epic', color: ['#FFD700', '#FFA500', '#FF8C00'] },
  { id: 44, name: 'Moon Rock', emoji: '🌙', unlockedByLevel: 44, rarity: 'epic', color: ['#C0C0C0', '#E0E0E0'] },
  { id: 45, name: 'Crystal Candy', emoji: '💎', unlockedByLevel: 45, rarity: 'epic', color: ['#87CEEB', '#00CED1', '#40E0D0'] },
  
  // Level 46-48 (Legendary)
  { id: 46, name: 'Golden Candy', emoji: '⭐', unlockedByLevel: 46, rarity: 'legendary', color: ['#FFD700', '#FFA500', '#FF8C00'] },
  { id: 47, name: 'Rainbow Candy', emoji: '🌈', unlockedByLevel: 47, rarity: 'legendary', color: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'] },
  { id: 48, name: 'Unicorn Candy', emoji: '🦄', unlockedByLevel: 48, rarity: 'legendary', color: ['#FF69B4', '#DA70D6', '#BA55D3'] },
  
  // Level 49-50 (Mythical)
  { id: 49, name: 'Mythical Candy', emoji: '🏆', unlockedByLevel: 49, rarity: 'mythical', color: ['#FFD700', '#FFA500', '#FF6347', '#FF1493'] },
  { id: 50, name: 'Ultimate Candy', emoji: '👑', unlockedByLevel: 50, rarity: 'mythical', color: ['#FFD700', '#FFA500', '#FF8C00', '#FF6347'] },
];

const getRarityColor = (rarity) => {
  switch(rarity) {
    case 'common': return '#4CAF50';
    case 'rare': return '#2196F3';
    case 'epic': return '#9C27B0';
    case 'legendary': return '#FF9800';
    case 'mythical': return '#E91E63';
    default: return '#4CAF50';
  }
};

const getRarityEmoji = (rarity) => {
  switch(rarity) {
    case 'common': return '⭐';
    case 'rare': return '🌟';
    case 'epic': return '💫';
    case 'legendary': return '👑';
    case 'mythical': return '💎';
    default: return '⭐';
  }
};

export default function CandyCollectionScreen({ gameId = 'candy_match' }) {
  const [collected, setCollected] = useState([]);
  const [selectedCandy, setSelectedCandy] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [userLevel, setUserLevel] = useState(1);
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    loadCollectedAndProgress();
  }, []);

  const loadCollectedAndProgress = async () => {
    try {
      // Load collected candies from your storage system
      const progress = await getLevelProgress(gameId);
      const unlockedLevels = await getUnlockedLevels(gameId);
      const stars = await getTotalStarsEarned(gameId);
      
      setTotalStars(stars);
      
      // Calculate user's current max level (highest completed level)
      let maxLevel = 1;
      if (progress.length > 0) {
        maxLevel = Math.max(...progress.map(p => p.levelNumber));
      }
      setUserLevel(maxLevel);
      
      // Determine which candies are collected based on completed levels
      // A candy is collected if the user has completed the required level
      const collectedCandies = ALL_CANDIES.filter(candy => 
        maxLevel >= candy.unlockedByLevel
      ).map(candy => candy.emoji);
      
      setCollected(collectedCandies);
      
      // Also save to your global storage for consistency
      await AsyncStorage.setItem('collected_candies', JSON.stringify(collectedCandies));
      
    } catch (error) {
      console.error('Error loading collection:', error);
      // Fallback to simple storage
      const stored = await AsyncStorage.getItem('collected_candies');
      if (stored) {
        setCollected(JSON.parse(stored));
      }
    }
  };

  const animateCard = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const CandyCard = ({ item, isCollected }) => {
    const rarityColor = getRarityColor(item.rarity);
    const rarityEmoji = getRarityEmoji(item.rarity);
    const isUnlocked = userLevel >= item.unlockedByLevel;
    
    return (
      <TouchableOpacity 
        onPress={() => {
          if (isCollected) {
            setSelectedCandy(item);
            animateCard();
          }
        }}
        activeOpacity={0.9}
        style={styles.cardTouchable}
      >
        <Animated.View style={{ 
          flex: 1,
          transform: [{ scale: selectedCandy?.id === item.id ? scaleAnim : 1 }] 
        }}>
          <LinearGradient 
            colors={isCollected ? item.color : (isUnlocked ? ['#999', '#777'] : ['#666', '#555'])} 
            style={[
              styles.candyCard,
              isCollected && styles.collectedCard,
              !isCollected && styles.lockedCard
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {!isCollected && (
              <View style={styles.lockOverlay}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            )}
            
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.rarityText}>
                {rarityEmoji} {item.rarity.toUpperCase()} {rarityEmoji}
              </Text>
            </View>
            
            <Text style={[styles.candyEmoji, !isCollected && styles.lockedEmoji]}>
              {item.emoji}
            </Text>
            
            <Text style={[styles.candyName, !isCollected && styles.lockedText]}>
              {item.name}
            </Text>
            
            {!isCollected && (
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>
                  {isUnlocked ? 'Complete level to collect!' : `Reach Level ${item.unlockedByLevel}`}
                </Text>
                <LinearGradient 
                  colors={['#FFD700', '#FFA500']} 
                  style={styles.levelBar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            )}
            
            {isCollected && (
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✅</Text>
              </View>
            )}
            
            {(isCollected && (item.rarity === 'legendary' || item.rarity === 'mythical')) && (
              <Text style={styles.sparkle}>✨</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderCandy = ({ item }) => {
    const isCollected = collected.includes(item.emoji);
    return <CandyCard item={item} isCollected={isCollected} />;
  };

  const completionPercentage = (collected.length / ALL_CANDIES.length) * 100;
  
  const CelebrationBar = () => (
    <View style={styles.celebrationContainer}>
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF6347']}
          style={[styles.progressBar, { width: `${completionPercentage}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>🍬 {collected.length}/{ALL_CANDIES.length} Candies</Text>
        <Text style={styles.statsText}>🎯 {Math.floor(completionPercentage)}% Complete</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>⭐ Total Stars: {totalStars}</Text>
        <Text style={styles.statsText}>📊 Level: {userLevel}</Text>
      </View>
    </View>
  );

  const CandyDetailModal = () => {
    if (!selectedCandy) return null;
    
    return (
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setSelectedCandy(null)}
      >
        <LinearGradient
          colors={selectedCandy.color}
          style={styles.modalContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedCandy(null)}>
            <Text style={styles.closeButtonText}>✖</Text>
          </TouchableOpacity>
          <Text style={styles.modalEmoji}>{selectedCandy.emoji}</Text>
          <Text style={styles.modalName}>{selectedCandy.name}</Text>
          <View style={[styles.modalRarityBadge, { backgroundColor: getRarityColor(selectedCandy.rarity) }]}>
            <Text style={styles.modalRarityText}>
              {getRarityEmoji(selectedCandy.rarity)} {selectedCandy.rarity.toUpperCase()} {getRarityEmoji(selectedCandy.rarity)}
            </Text>
          </View>
          <Text style={styles.modalDescription}>
            {selectedCandy.rarity === 'mythical' && '💎 A LEGENDARY candy of myths and magic! Only the bravest collectors find this! 💎'}
            {selectedCandy.rarity === 'legendary' && '🌟 A magical candy that sparkles with joy and brings happiness! 🌟'}
            {selectedCandy.rarity === 'epic' && '⚡ An amazing candy that gives you super powers and epic adventures! ⚡'}
            {selectedCandy.rarity === 'rare' && '✨ A special candy that brings good luck and magical moments! ✨'}
            {selectedCandy.rarity === 'common' && '🍭 A delicious candy that makes you smile and fills your day with joy! 🍭'}
          </Text>
          <Text style={styles.modalUnlockInfo}>
            Unlocked at Level {selectedCandy.unlockedByLevel}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍬 Candy Collection Book 🍬</Text>
        <Text style={styles.subtitle}>Collect all 50 yummy candies!</Text>
      </View>
      
      <CelebrationBar />
      
      <FlatList
        data={ALL_CANDIES}
        renderItem={renderCandy}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
      
      {selectedCandy && <CandyDetailModal />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginTop: 50,
    
    marginBottom: spacing.small,
  },
  title: { 
    fontSize:25, 
    fontWeight: 'bold', 
    color: candyTheme.textLight, 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: { 
    fontSize: fontSizes.body, 
    color: candyTheme.textLight, 
    textAlign: 'center',
    marginTop: spacing.small,
    fontStyle: 'italic',
  },
  celebrationContainer: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.medium,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: spacing.small,
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.small,
    marginTop: 4,
  },
  statsText: {
    fontSize: fontSizes.small,
    color: candyTheme.textLight,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  grid: { 
    padding: spacing.medium,
    paddingBottom: spacing.large * 2,
  },
  cardTouchable: {
    flex: 1,
    margin: spacing.small,
  },
  candyCard: { 
    flex: 1,
    padding: spacing.medium, 
    borderRadius: 20, 
    alignItems: 'center', 
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  collectedCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  lockedCard: {
    opacity: 0.8,
  },
  lockOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  lockIcon: {
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rarityBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    zIndex: 1,
  },
  rarityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  candyEmoji: { 
    fontSize: 60,
    marginVertical: spacing.medium,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  candyName: { 
    fontSize: fontSizes.body, 
    fontWeight: 'bold', 
    color: candyTheme.textLight,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  lockedText: {
    opacity: 0.7,
  },
  levelContainer: {
    marginTop: spacing.small,
    alignItems: 'center',
    width: '100%',
  },
  levelText: {
    fontSize: fontSizes.small,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  levelBar: {
    height: 4,
    width: '80%',
    borderRadius: 2,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  checkmark: { 
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sparkle: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 30,
    transform: [{ rotate: '15deg' }],
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '85%',
    padding: spacing.large,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  modalEmoji: {
    fontSize: 100,
    marginVertical: spacing.medium,
  },
  modalName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    marginBottom: spacing.medium,
  },
  modalRarityBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: spacing.medium,
  },
  modalRarityText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.medium,
    fontStyle: 'italic',
  },
  modalUnlockInfo: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    marginTop: spacing.medium,
    fontWeight: 'bold',
  },
});