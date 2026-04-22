import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import { LEVELS } from '../data/levels';
import { candyTheme, fontSizes, spacing } from '../styles/theme';
import { getLevelStars, getUnlockedLevels } from '../utils/storage';

export default function LevelSelectScreen({ navigation }) {
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [levelStars, setLevelStars] = useState({});
  
  const worlds = [];
  for (let i = 0; i < 100; i += 20) {
    worlds.push({
      id: i / 20 + 1,
      levels: LEVELS.slice(i, i + 20),
      startLevel: i + 1,
      endLevel: Math.min(i + 20, 100)
    });
  }
  
  const currentWorld = worlds[selectedWorld - 1];
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const unlocked = await getUnlockedLevels();
    setUnlockedLevels(unlocked);
    
    const stars = {};
    for (let i = 1; i <= 100; i++) {
      stars[i] = await getLevelStars(i);
    }
    setLevelStars(stars);
  };
  
  const renderLevel = ({ item: level }) => {
    const isUnlocked = unlockedLevels.includes(level.levelNumber);
    const stars = levelStars[level.levelNumber] || 0;
    
    return (
      <TouchableOpacity
        style={[styles.levelCard, !isUnlocked && styles.levelLocked]}
        onPress={() => {
          if (isUnlocked) {
            navigation.navigate('Game', { levelNumber: level.levelNumber });
          }
        }}
        disabled={!isUnlocked}
      >
        <LinearGradient
          colors={isUnlocked ? [candyTheme.candyYellow, candyTheme.candyOrange] : ['#999', '#666']}
          style={styles.levelGradient}
        >
          <Text style={styles.levelNumber}>{level.levelNumber}</Text>
          <Text style={styles.starsText}>
            {stars > 0 ? '⭐'.repeat(stars) : '☆☆☆'}
          </Text>
          {!isUnlocked && <Text style={styles.lockIcon}>🔒</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  };
  
  return (
    <LinearGradient colors={[candyTheme.gradientStart, candyTheme.gradientEnd]} style={styles.container}>
      <Text style={styles.title}>Level</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.worldSelector}>
        {worlds.map(world => (
          <TouchableOpacity
            key={world.id}
            style={[
              styles.worldButton,
              selectedWorld === world.id && styles.worldButtonActive
            ]}
            onPress={() => setSelectedWorld(world.id)}
          >
            <Text style={styles.worldText}>World {world.id}</Text>
            <Text style={styles.worldLevels}>{world.startLevel}-{world.endLevel}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <FlatList
        data={currentWorld.levels}
        renderItem={renderLevel}
        keyExtractor={(item) => item.id.toString()}
        numColumns={4}
        contentContainerStyle={styles.levelGrid}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { 
    fontSize: fontSizes.title, 
    fontWeight: 'bold', 
    color: candyTheme.textLight, 
    textAlign: 'center', 
    marginTop: spacing.large 
  },
  worldSelector: { 
    flexDirection: 'row', 
    padding: spacing.medium, 
    maxHeight: 80 
  },
  worldButton: { 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    padding: spacing.small, 
    marginHorizontal: spacing.small, 
    borderRadius: 10, 
    minWidth: 80, 
    alignItems: 'center' 
  },
  worldButtonActive: { 
    backgroundColor: 'rgba(255,255,255,0.8)' 
  },
  worldText: { 
    fontWeight: 'bold', 
    color: candyTheme.textDark 
  },
  worldLevels: { 
    fontSize: fontSizes.small, 
    color: candyTheme.textDark 
  },
  levelGrid: { 
    padding: spacing.medium 
  },
  levelCard: { 
    width: 70, 
    height: 80, 
    margin: spacing.small, 
    borderRadius: 15, 
    overflow: 'hidden' 
  },
  levelLocked: { 
    opacity: 0.5 
  },
  levelGradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  levelNumber: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: candyTheme.textLight 
  },
  starsText: {
    fontSize: 12,
    marginTop: 4,
    color: candyTheme.textLight,
  },
  lockIcon: { 
    fontSize: 20, 
      
  },
});