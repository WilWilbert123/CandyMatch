import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const SHOP_ITEMS = [
  // Visual Items (0-100 stars)
  {
    id: 1,
    name: 'Rainbow Lollipop',
    emoji: '🍭',
    price: 30,
    type: 'visual',
    rarity: 'common',
    description: 'Adds rainbow colors to cards',
    previewEffect: '🌈',
  },
  {
    id: 2,
    name: 'Golden Frame',
    emoji: '🏆',
    price: 100,
    type: 'visual',
    rarity: 'legendary',
    description: 'Golden border around cards',
    previewEffect: '✨',
  },
  {
    id: 3,
    name: 'Sparkle Effect',
    emoji: '✨',
    price: 20,
    type: 'effect',
    rarity: 'common',
    description: 'Cards sparkle when matched',
    previewEffect: '⭐',
  },
  {
    id: 4,
    name: 'Rainbow Trail',
    emoji: '🌈',
    price: 25,
    type: 'effect',
    rarity: 'rare',
    description: 'Colorful trail on matches',
    previewEffect: '🌈',
  },
  {
    id: 5,
    name: 'Confetti Blast',
    emoji: '🎉',
    price: 35,
    type: 'effect',
    rarity: 'rare',
    description: 'Confetti on level complete',
    previewEffect: '🎊',
  },
  {
    id: 6,
    name: 'Glow Effect',
    emoji: '💫',
    price: 45,
    type: 'effect',
    rarity: 'epic',
    description: 'Cards glow when flipped',
    previewEffect: '✨',
  },

  // Avatar Items
  {
    id: 7,
    name: 'Magic Unicorn',
    emoji: '🦄',
    price: 50,
    type: 'avatar',
    rarity: 'epic',
    description: 'Unicorn profile avatar',
    previewEffect: '🦄',
  },
  {
    id: 8,
    name: 'Cute Bear',
    emoji: '🐻',
    price: 15,
    type: 'avatar',
    rarity: 'common',
    description: 'Cute bear avatar',
    previewEffect: '🐻',
  },
  {
    id: 9,
    name: 'Rainbow Cat',
    emoji: '🐱',
    price: 25,
    type: 'avatar',
    rarity: 'rare',
    description: 'Rainbow cat avatar',
    previewEffect: '🐱',
  },
  {
    id: 10,
    name: 'Dragon',
    emoji: '🐉',
    price: 75,
    type: 'avatar',
    rarity: 'legendary',
    description: 'Epic dragon avatar',
    previewEffect: '🐉',
  },
  {
    id: 11,
    name: 'Penguin',
    emoji: '🐧',
    price: 20,
    type: 'avatar',
    rarity: 'common',
    description: 'Cute penguin avatar',
    previewEffect: '🐧',
  },
  {
    id: 12,
    name: 'Fox',
    emoji: '🦊',
    price: 30,
    type: 'avatar',
    rarity: 'rare',
    description: 'Clever fox avatar',
    previewEffect: '🦊',
  },

  // Audio Items
  {
    id: 13,
    name: 'Candy Music',
    emoji: '🎵',
    price: 40,
    type: 'audio',
    rarity: 'rare',
    description: 'Sweet candy melody',
    previewEffect: '🎶',
  },
  {
    id: 14,
    name: 'Happy Tune',
    emoji: '🎶',
    price: 35,
    type: 'audio',
    rarity: 'common',
    description: 'Cheerful background music',
    previewEffect: '🎵',
  },
  {
    id: 15,
    name: 'Victory Fanfare',
    emoji: '📯',
    price: 55,
    type: 'audio',
    rarity: 'epic',
    description: 'Epic win sound effect',
    previewEffect: '🎺',
  },

  // Special Power-Ups
  {
    id: 16,
    name: 'Extra Time',
    emoji: '⏰',
    price: 30,
    type: 'powerup',
    rarity: 'common',
    description: '+10 seconds on timed levels',
    previewEffect: '⏱️',
  },
  {
    id: 17,
    name: 'Hint Button',
    emoji: '💡',
    price: 25,
    type: 'powerup',
    rarity: 'common',
    description: 'Get hints when stuck',
    previewEffect: '💡',
  },
  {
    id: 18,
    name: 'Shuffle',
    emoji: '🔄',
    price: 20,
    type: 'powerup',
    rarity: 'common',
    description: 'Shuffle all cards once per level',
    previewEffect: '🃏',
  },
  {
    id: 19,
    name: 'Star Boost',
    emoji: '⭐',
    price: 50,
    type: 'powerup',
    rarity: 'epic',
    description: 'Start with +1 star bonus',
    previewEffect: '🌟',
  },
  {
    id: 20,
    name: 'Mega Score',
    emoji: '💥',
    price: 80,
    type: 'powerup',
    rarity: 'legendary',
    description: 'Double points for 1 minute',
    previewEffect: '💯',
  },
];

const getRarityGradient = (rarity) => {
  switch (rarity) {
    case 'common':
      return ['#4A90E2', '#357ABD'];
    case 'rare':
      return ['#9B59B6', '#8E44AD'];
    case 'epic':
      return ['#E74C3C', '#C0392B'];
    case 'legendary':
      return ['#F39C12', '#E67E22'];
    default:
      return ['#FF6B9D', '#FF85A1'];
  }
};

const getRarityBorder = (rarity) => {
  switch (rarity) {
    case 'common':
      return '#4A90E2';
    case 'rare':
      return '#9B59B6';
    case 'epic':
      return '#E74C3C';
    case 'legendary':
      return '#F39C12';
    default:
      return '#FF6B9D';
  }
};

const getTypeConfig = (type) => {
  const configs = {
    visual: { emoji: '🎨', color: '#FF6B9D', label: 'Visual' },
    avatar: { emoji: '👤', color: '#4ECDC4', label: 'Avatar' },
    audio: { emoji: '🎵', color: '#9B59B6', label: 'Audio' },
    powerup: { emoji: '⚡', color: '#F39C12', label: 'Power-Up' },
    effect: { emoji: '✨', color: '#3498DB', label: 'Effect' },
  };
  return configs[type] || configs.visual;
};

const categories = [
  { id: 'all', name: 'All', emoji: '📦' },
  { id: 'visual', name: 'Visual', emoji: '🎨' },
  { id: 'avatar', name: 'Avatars', emoji: '👤' },
  { id: 'effect', name: 'Effects', emoji: '✨' },
  { id: 'audio', name: 'Audio', emoji: '🎵' },
  { id: 'powerup', name: 'Power-Ups', emoji: '⚡' },
];

// Separate component for shop items to properly use hooks
const ShopItem = ({ item, isOwned, stars, onPress, index }) => {
  const rarityColors = getRarityGradient(item.rarity);
  const typeConfig = getTypeConfig(item.type);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={[
        styles.itemWrapper,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={rarityColors}
          style={styles.itemCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          {isOwned && (
            <View style={styles.ownedBadge}>
              <Text style={styles.ownedBadgeText}>✓</Text>
            </View>
          )}

          <View style={styles.itemEmojiContainer}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            {item.previewEffect && (
              <View style={styles.previewEffect}>
                <Text style={styles.previewEffectText}>{item.previewEffect}</Text>
              </View>
            )}
          </View>

          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.itemTags}>
            <View style={[styles.typeTag, { backgroundColor: typeConfig.color + '30' }]}>
              <Text style={styles.typeTagText}>
                {typeConfig.emoji} {typeConfig.label}
              </Text>
            </View>
            <View
              style={[
                styles.rarityTag,
                {
                  backgroundColor:
                    item.rarity === 'legendary'
                      ? '#FFD70030'
                      : item.rarity === 'epic'
                      ? '#E74C3C30'
                      : item.rarity === 'rare'
                      ? '#9B59B630'
                      : '#4A90E230',
                },
              ]}>
              <Text
                style={[
                  styles.rarityTagText,
                  {
                    color:
                      item.rarity === 'legendary'
                        ? '#FFD700'
                        : item.rarity === 'epic'
                        ? '#E74C3C'
                        : item.rarity === 'rare'
                        ? '#9B59B6'
                        : '#4A90E2',
                  },
                ]}>
                {item.rarity}
              </Text>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.pricePill}>
              <Text style={styles.priceEmoji}>⭐</Text>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
            {isOwned ? (
              <View style={styles.ownedPill}>
                <Text style={styles.ownedPillText}>Owned</Text>
              </View>
            ) : (
              <View style={styles.buyPill}>
                <Text style={styles.buyPillText}>Buy</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PurchaseModal = ({ visible, item, onClose, onConfirm, stars }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!item) return null;

  const canAfford = stars >= item.price;
  const rarityColors = getRarityGradient(item.rarity);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={rarityColors} style={styles.modalGradient}>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalEmoji}>{item.emoji}</Text>
            <Text style={styles.modalTitle}>{item.name}</Text>
            <Text style={styles.modalDescription}>{item.description}</Text>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Type</Text>
                <Text style={styles.modalDetailValue}>
                  {getTypeConfig(item.type).emoji} {getTypeConfig(item.type).label}
                </Text>
              </View>
              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Rarity</Text>
                <Text
                  style={[
                    styles.modalDetailValue,
                    { color: item.rarity === 'legendary' ? '#FFD700' : '#FFF' },
                  ]}>
                  {item.rarity.toUpperCase()}
                </Text>
              </View>
              <View style={styles.modalDetailItem}>
                <Text style={styles.modalDetailLabel}>Price</Text>
                <Text style={styles.modalDetailValue}>⭐ {item.price}</Text>
              </View>
            </View>

            {!canAfford && (
              <View style={styles.modalWarning}>
                <Text style={styles.modalWarningText}>
                  You need {item.price - stars} more stars!
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  !canAfford && styles.modalConfirmDisabled,
                ]}
                onPress={() => canAfford && onConfirm()}
                disabled={!canAfford}>
                <LinearGradient
                  colors={canAfford ? ['#FFD700', '#FFA500'] : ['#999', '#777']}
                  style={styles.modalConfirmGradient}>
                  <Text style={styles.modalConfirmText}>
                    {canAfford ? 'Purchase ✨' : 'Not Enough Stars'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const Toast = ({ message, visible, type = 'success' }) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2000);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { transform: [{ translateY }] },
        type === 'success' ? styles.toastSuccess : styles.toastError,
      ]}>
      <Text style={styles.toastEmoji}>{type === 'success' ? '🎉' : '😢'}</Text>
      <Text style={styles.toastMessage}>{message}</Text>
    </Animated.View>
  );
};

export default function CandyShopScreen() {
  const [stars, setStars] = useState(0);
  const [purchased, setPurchased] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadData();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadData = async () => {
    const totalStars = await AsyncStorage.getItem('total_stars');
    setStars(totalStars ? parseInt(totalStars) : 250);

    const purchasedItems = await AsyncStorage.getItem('purchased_items');
    setPurchased(purchasedItems ? JSON.parse(purchasedItems) : []);
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  };

  const handlePurchase = async (item) => {
    if (purchased.includes(item.id)) {
      showToast(`You already own ${item.name}!`, 'error');
      return;
    }

    if (stars < item.price) {
      showToast(`Need ${item.price - stars} more stars!`, 'error');
      return;
    }

    const newStars = stars - item.price;
    await AsyncStorage.setItem('total_stars', newStars.toString());

    const newPurchased = [...purchased, item.id];
    await AsyncStorage.setItem('purchased_items', JSON.stringify(newPurchased));

    setStars(newStars);
    setPurchased(newPurchased);
    setModalVisible(false);
    showToast(`✨ You got ${item.name}! ✨`, 'success');
  };

  const openPurchaseModal = (item) => {
    if (!purchased.includes(item.id)) {
      setSelectedItem(item);
      setModalVisible(true);
    }
  };

  const filteredItems =
    selectedCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.type === selectedCategory);

  const totalItems = SHOP_ITEMS.length;
  const purchasedCount = purchased.length;
  const collectionPercent = Math.round((purchasedCount / totalItems) * 100);

  const renderHeader = () => (
    <Animated.View style={[styles.headerSection, { opacity: headerOpacity }]}>
       

      <Animated.View style={[styles.starsCard, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient colors={['#FFD700', '#FFA500', '#FF8C00']} style={styles.starsGradient}>
          <Text style={styles.starsEmoji}>⭐</Text>
          <Text style={styles.starsAmount}>{stars}</Text>
          <Text style={styles.starsLabel}>STARS AVAILABLE</Text>
        </LinearGradient>
      </Animated.View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Collection Progress</Text>
          <Text style={styles.progressPercent}>{collectionPercent}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressFill, { width: `${collectionPercent}%` }]} />
        </View>
        <Text style={styles.progressStats}>
          {purchasedCount} / {totalItems} items collected
        </Text>
      </View>
    </Animated.View>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.categoryButton, selectedCategory === cat.id && styles.categoryActive]}
          onPress={() => setSelectedCategory(cat.id)}>
          <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
          <Text
            style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
            {cat.name}
          </Text>
          {selectedCategory === cat.id && <View style={styles.categoryActiveIndicator} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item, index }) => {
    const isOwned = purchased.includes(item.id);
    return (
      <ShopItem
        item={item}
        isOwned={isOwned}
        stars={stars}
        index={index}
        onPress={() => openPurchaseModal(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[candyTheme.gradientStart, candyTheme.gradientEnd]}
        style={styles.container}>
        <Animated.FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderCategoryFilter()}
            </>
          }
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍬</Text>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyText}>Try a different category</Text>
            </View>
          }
        />

        <PurchaseModal
          visible={modalVisible}
          item={selectedItem}
          stars={stars}
          onClose={() => setModalVisible(false)}
          onConfirm={() => handlePurchase(selectedItem)}
        />

        <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: candyTheme.gradientStart },
  container: { flex: 1 },
  headerSection: { paddingHorizontal: spacing.large, paddingTop: spacing.large, paddingBottom: spacing.medium },
  welcomeSection: { alignItems: 'center', marginBottom: spacing.large },
  welcomeTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, marginBottom: 4 },
  welcomeSubtitle: { fontSize: fontSizes.small, color: 'rgba(255,255,255,0.8)' },
  starsCard: { marginBottom: spacing.large, borderRadius: 60, overflow: 'hidden', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  starsGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.large, paddingVertical: spacing.medium },
  starsEmoji: { fontSize: 32, marginRight: spacing.small },
  starsAmount: { fontSize: 40, fontWeight: '800', color: '#FFF', marginRight: spacing.small, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  starsLabel: { fontSize: 14, fontWeight: '600', color: '#FFF', opacity: 0.9 },
  progressContainer: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: spacing.medium },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.small },
  progressTitle: { fontSize: fontSizes.body, fontWeight: '600', color: '#FFF' },
  progressPercent: { fontSize: fontSizes.title, fontWeight: '800', color: '#FFD700' },
  progressBarContainer: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: spacing.small },
  progressFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 4 },
  progressStats: { fontSize: fontSizes.small, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  categoryContainer: { marginBottom: spacing.medium },
  categoryContent: { paddingHorizontal: spacing.medium },
  categoryButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.medium, paddingVertical: spacing.small, marginHorizontal: 4, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', position: 'relative' },
  categoryActive: { backgroundColor: '#FFD700' },
  categoryEmoji: { fontSize: 18, marginRight: 6 },
  categoryText: { fontSize: fontSizes.small, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  categoryTextActive: { color: '#2C3E50' },
  categoryActiveIndicator: { position: 'absolute', bottom: -4, left: '50%', marginLeft: -8, width: 16, height: 4, backgroundColor: '#FFD700', borderRadius: 2 },
  gridContainer: { padding: spacing.small, paddingBottom: spacing.xlarge },
  itemWrapper: { flex: 1, margin: spacing.small },
  itemCard: { borderRadius: 20, padding: spacing.medium, minHeight: 210, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,   overflow: 'hidden' },
  ownedBadge: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: '#2ECC71', alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4  },
  ownedBadgeText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  itemEmojiContainer: { position: 'relative', alignItems: 'center', marginBottom: spacing.small },
  itemEmoji: { fontSize: 60, marginBottom: spacing.small },
  previewEffect: { position: 'absolute', top: -10, right: -10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 4 },
  previewEffectText: { fontSize: 16 },
  itemName: { fontSize: fontSizes.body, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 4 },
  itemDescription: { fontSize: fontSizes.small, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: spacing.small },
  itemTags: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: spacing.medium, flexWrap: 'wrap' },
  typeTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeTagText: { fontSize: 10, fontWeight: '600', color: '#FFF' },
  rarityTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rarityTagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  pricePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  priceEmoji: { fontSize: 14, marginRight: 4 },
  priceText: { fontSize: fontSizes.body, fontWeight: '700', color: '#FFD700' },
  ownedPill: { backgroundColor: '#2ECC71', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  ownedPillText: { fontSize: fontSizes.small, fontWeight: '700', color: '#FFF' },
  buyPill: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  buyPillText: { fontSize: fontSizes.small, fontWeight: '600', color: '#FFF' },
  emptyContainer: { alignItems: 'center', padding: spacing.xlarge },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.medium },
  emptyTitle: { fontSize: fontSizes.title, fontWeight: '700', color: '#FFF', marginBottom: spacing.small },
  emptyText: { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.7)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: width * 0.85, borderRadius: 30, overflow: 'hidden' },
  modalGradient: { padding: spacing.large, alignItems: 'center' },
  modalClose: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  modalCloseText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  modalEmoji: { fontSize: 80, marginBottom: spacing.medium },
  modalTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: spacing.small, textAlign: 'center' },
  modalDescription: { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: spacing.large },
  modalDetails: { width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: spacing.medium, marginBottom: spacing.large },
  modalDetailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  modalDetailLabel: { fontSize: fontSizes.small, color: 'rgba(255,255,255,0.7)' },
  modalDetailValue: { fontSize: fontSizes.small, fontWeight: '600', color: '#FFF' },
  modalWarning: { backgroundColor: 'rgba(231, 76, 60, 0.3)', padding: spacing.small, borderRadius: 12, marginBottom: spacing.medium },
  modalWarningText: { fontSize: fontSizes.small, color: '#E74C3C', textAlign: 'center' },
  modalButtons: { flexDirection: 'row', width: '100%', gap: spacing.medium },
  modalCancelButton: { flex: 1, paddingVertical: spacing.medium, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  modalCancelText: { fontSize: fontSizes.body, fontWeight: '600', color: '#FFF' },
  modalConfirmButton: { flex: 1, borderRadius: 25, overflow: 'hidden' },
  modalConfirmDisabled: { opacity: 0.6 },
  modalConfirmGradient: { paddingVertical: spacing.medium, alignItems: 'center' },
  modalConfirmText: { fontSize: fontSizes.body, fontWeight: '700', color: '#2C3E50' },
  toastContainer: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.medium, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,   zIndex: 1000 },
  toastSuccess: { backgroundColor: '#2ECC71' },
  toastError: { backgroundColor: '#E74C3C' },
  toastEmoji: { fontSize: 20, marginRight: spacing.small },
  toastMessage: { fontSize: fontSizes.body, fontWeight: '600', color: '#FFF' },
});