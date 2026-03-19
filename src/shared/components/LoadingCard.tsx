import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

type LoadingCardProps = {
  text: string;
};

export function LoadingCard({ text }: LoadingCardProps) {
  const opacity = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    gap: 10,
  },
  text: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
