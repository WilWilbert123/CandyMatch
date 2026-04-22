import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { candyTheme, fontSizes, spacing } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function LevelCompleteModal({
    visible,
    levelNumber,
    score,
    moves,
    starsEarned,
    nextLevel,
    onPlayAgain,
    onNextLevel,
    onLevelMap,
}) {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Animate modal in
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset animations
            scaleValue.setValue(0);
            opacityValue.setValue(0);
        }
    }, [visible]);

    const starDisplay = '⭐'.repeat(starsEarned);
    const isLastLevel = nextLevel > 100;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
                <TouchableWithoutFeedback onPress={onLevelMap}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ scale: scaleValue }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[candyTheme.gradientStart, candyTheme.gradientEnd]}
                        style={styles.modalGradient}
                    >
                       

                        {/* Title */}
                        <Text style={styles.title}>
                            Level {levelNumber} Complete!
                        </Text>

                        {/* Stars Rating */}
                        <View style={styles.starsContainer}>
                            {[1, 2, 3].map((star) => (
                                <Text
                                    key={star}
                                    style={[
                                        styles.starIcon,
                                        star <= starsEarned && styles.starActive,
                                    ]}
                                >
                                    {star <= starsEarned ? '★' : '☆'}
                                </Text>
                            ))}
                        </View>

                        {/* Score Card */}
                        <View style={styles.statsCard}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>🏆 Score</Text>
                                <Text style={styles.statValue}>{score}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>🎯 Moves</Text>
                                <Text style={styles.statValue}>{moves}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>⭐ Stars</Text>
                                <Text style={styles.statValue}>{starsEarned}/3</Text>
                            </View>
                        </View>

                        {/* Message */}
                        <Text style={styles.message}>
                            {isLastLevel
                                ? '🏆 AMAZING! You conquered all 100 levels! 🏆'
                                : `✨ Next level unlocked! ✨`}
                        </Text>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSecondary]}
                                onPress={onPlayAgain}
                            >
                                <Text style={styles.buttonTextSecondary}>Play Again</Text>
                            </TouchableOpacity>

                            {!isLastLevel && (
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonPrimary]}
                                    onPress={onNextLevel}
                                >
                                    <LinearGradient
                                        colors={[candyTheme.candyYellow, candyTheme.candyOrange]}
                                        style={styles.buttonGradient}
                                    >
                                        <Text style={styles.buttonTextPrimary}>
                                            Next Level {nextLevel} 
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={onLevelMap}
                        >
                            <Text style={styles.mapButtonText}>Back to Level Map</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        width: width,
        height: height,
    },
    modalContainer: {
        width: width * 0.85,
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalGradient: {
        padding: spacing.xlarge,
        alignItems: 'center',
    },
    
    celebrationIcon: {
        fontSize: 40,
    },
    title: {
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        color: candyTheme.textLight,
        textAlign: 'center',
        marginBottom: spacing.medium,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: spacing.large,
        gap: spacing.small,
    },
    starIcon: {
        fontSize: 45,
        color: '#ccc',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    starActive: {
        color: '#FFD700',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: spacing.medium,
        marginBottom: spacing.large,
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: fontSizes.small,
        color: candyTheme.textLight,
        opacity: 0.9,
        marginBottom: spacing.small,
    },
    statValue: {
        fontSize: fontSizes.subtitle,
        fontWeight: 'bold',
        color: candyTheme.textLight,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: spacing.medium,
    },
    message: {
        fontSize: fontSizes.body,
        color: candyTheme.textLight,
        textAlign: 'center',
        marginBottom: spacing.large,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.medium,
        marginBottom: spacing.medium,
        width: '120%',
    },
    button: {
        flex: 1,
        borderRadius: 25,
        overflow: 'hidden',
         
    },
    buttonPrimary: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
 
    },
    buttonSecondary: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: spacing.medium,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    buttonGradient: {
        paddingVertical: spacing.medium,
        alignItems: 'center',
    },
    buttonTextPrimary: {
        color: candyTheme.textDark,
        fontSize: fontSizes.body,
        fontWeight: 'bold',
    },
    buttonTextSecondary: {
        color: candyTheme.textLight,
        fontSize: fontSizes.body,
        fontWeight: 'bold',
    },
    mapButton: {
        paddingVertical: spacing.small,
    },
    mapButtonText: {
        color: candyTheme.textLight,
        fontSize: fontSizes.small,
        opacity: 0.8,
        textDecorationLine: 'underline',
    },
});