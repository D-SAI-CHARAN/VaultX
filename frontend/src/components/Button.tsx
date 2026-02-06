// Button Component - VaultX

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'danger' && styles.buttonDanger,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.textPrimary,
    variant === 'secondary' && styles.textSecondary,
    variant === 'danger' && styles.textDanger,
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.textPrimary} size="small" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.surfaceHighlight,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonDanger: {
    backgroundColor: theme.colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  textPrimary: {
    color: theme.colors.textPrimary,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
  },
  textDanger: {
    color: theme.colors.errorText,
  },
  textDisabled: {
    color: theme.colors.textDisabled,
  },
});
