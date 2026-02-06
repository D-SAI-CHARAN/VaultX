// Text Input Component - VaultX

import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoFocus?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoFocus = false,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        <RNTextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsSecure(!isSecure)}
          >
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputContainerFocused: {
    borderColor: theme.colors.textMuted,
  },
  inputContainerError: {
    borderColor: theme.colors.errorText,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
  },
  eyeButton: {
    padding: theme.spacing.md,
  },
  error: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.errorText,
    marginTop: theme.spacing.xs,
  },
});
