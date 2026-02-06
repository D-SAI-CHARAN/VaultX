// VaultX PIN Setup Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { PinInput } from '../../src/components/PinInput';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useAuthStore } from '../../src/store/authStore';

type SetupStage = 'primary' | 'confirmPrimary' | 'duress' | 'confirmDuress';

export default function PinSetupScreen() {
  const [stage, setStage] = useState<SetupStage>('primary');
  const [primaryPin, setPrimaryPin] = useState('');
  const [duressPin, setDuressPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setupPins, signOut, user } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out and start over?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/signin');
          },
        },
      ]
    );
  };

  const handlePinComplete = async (pin: string) => {
    setError('');
    
    switch (stage) {
      case 'primary':
        setPrimaryPin(pin);
        setStage('confirmPrimary');
        break;
        
      case 'confirmPrimary':
        if (pin === primaryPin) {
          setStage('duress');
        } else {
          setError('PINs do not match');
          setPrimaryPin('');
          setStage('primary');
        }
        break;
        
      case 'duress':
        if (pin === primaryPin) {
          setError('Duress PIN must be different from primary PIN');
        } else {
          setDuressPin(pin);
          setStage('confirmDuress');
        }
        break;
        
      case 'confirmDuress':
        if (pin === duressPin) {
          // Save PINs
          setIsLoading(true);
          const success = await setupPins(primaryPin, duressPin);
          setIsLoading(false);
          
          if (success) {
            router.replace('/setup/biometric');
          } else {
            Alert.alert('Error', 'Failed to save PINs. Please try again.');
            setStage('primary');
            setPrimaryPin('');
            setDuressPin('');
          }
        } else {
          setError('PINs do not match');
          setDuressPin('');
          setStage('duress');
        }
        break;
    }
  };

  const getStageInfo = () => {
    switch (stage) {
      case 'primary':
        return {
          title: 'Create Vault PIN',
          subtitle: 'This PIN unlocks your real vault',
        };
      case 'confirmPrimary':
        return {
          title: 'Confirm Vault PIN',
          subtitle: 'Enter your PIN again to confirm',
        };
      case 'duress':
        return {
          title: 'Create Duress PIN',
          subtitle: 'This PIN opens a decoy vault if you\'re forced to unlock',
        };
      case 'confirmDuress':
        return {
          title: 'Confirm Duress PIN',
          subtitle: 'Enter your duress PIN again to confirm',
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with user info and sign out */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={20} color={theme.colors.textMuted} />
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'Not signed in'}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.textMuted} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progress}>
        <View style={[
          styles.progressStep,
          (stage === 'primary' || stage === 'confirmPrimary') && styles.progressStepActive,
          (stage === 'duress' || stage === 'confirmDuress') && styles.progressStepComplete,
        ]}>
          <Text style={styles.progressText}>1</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={[
          styles.progressStep,
          (stage === 'duress' || stage === 'confirmDuress') && styles.progressStepActive,
        ]}>
          <Text style={styles.progressText}>2</Text>
        </View>
      </View>

      {(stage === 'duress' || stage === 'confirmDuress') && (
        <View style={styles.duressNote}>
          <Ionicons name="warning" size={18} color={theme.colors.warningText} />
          <Text style={styles.duressText}>
            Duress PIN: Opens a fake vault that doesn't contain your real documents.
            Use this if forced to unlock under threat.
          </Text>
        </View>
      )}

      <PinInput
        title={stageInfo.title}
        subtitle={stageInfo.subtitle}
        onComplete={handlePinComplete}
        error={error}
      />
      
      <LoadingOverlay visible={isLoading} message="Saving PINs securely..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userEmail: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
    maxWidth: 150,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  signOutText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: theme.colors.surfaceHighlight,
  },
  progressStepComplete: {
    backgroundColor: theme.colors.success,
  },
  progressText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },
  duressNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.warning,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  duressText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.warningText,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});
