// Secure PIN Input Component - VaultX

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface PinInputProps {
  title: string;
  subtitle?: string;
  pinLength?: number;
  onComplete: (pin: string) => void;
  error?: string;
  showBiometric?: boolean;
  onBiometric?: () => void;
}

export const PinInput: React.FC<PinInputProps> = ({
  title,
  subtitle,
  pinLength = 6,
  onComplete,
  error,
  showBiometric = false,
  onBiometric,
}) => {
  const [pin, setPin] = useState('');

  const handlePress = (digit: string) => {
    if (pin.length < pinLength) {
      const newPin = pin + digit;
      setPin(newPin);
      Vibration.vibrate(10);
      
      if (newPin.length === pinLength) {
        setTimeout(() => {
          onComplete(newPin);
          setPin('');
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      Vibration.vibrate(10);
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: pinLength }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < pin.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      [showBiometric ? 'bio' : '', '0', 'del'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={styles.keyEmpty} />;
              }
              
              if (key === 'bio') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.key}
                    onPress={onBiometric}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="finger-print" size={28} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                );
              }
              
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.key}
                    onPress={handleDelete}
                    onLongPress={() => setPin('')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="backspace-outline" size={28} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={styles.key}
                  onPress={() => handlePress(key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {renderDots()}
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      {renderKeypad()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: theme.colors.textPrimary,
    borderColor: theme.colors.textPrimary,
  },
  dotError: {
    borderColor: theme.colors.errorText,
    backgroundColor: theme.colors.errorText,
  },
  error: {
    color: theme.colors.errorText,
    fontSize: theme.typography.bodySmall.fontSize,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
    marginTop: theme.spacing.lg,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
});
