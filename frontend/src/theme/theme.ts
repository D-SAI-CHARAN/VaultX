// VaultX Dark Theme - ChatGPT-like minimal design

export const theme = {
  colors: {
    // Backgrounds
    background: '#0F0F0F',
    backgroundAlt: '#121212',
    
    // Surfaces
    surface: '#1E1E1E',
    surfaceAlt: '#202123',
    surfaceHighlight: '#2A2A2A',
    
    // Text
    textPrimary: '#EDEDED',
    textSecondary: '#BDBDBD',
    textMuted: '#8E8E8E',
    textDisabled: '#5C5C5C',
    
    // Accents (subtle, no bright colors)
    accent: '#4A4A4A',
    accentHighlight: '#5C5C5C',
    
    // Status colors (muted)
    success: '#3D5A3D',
    successText: '#7CB77C',
    error: '#5A3D3D',
    errorText: '#CB7C7C',
    warning: '#5A5A3D',
    warningText: '#CBCB7C',
    
    // Borders
    border: '#2E2E2E',
    borderLight: '#3A3A3A',
    
    // Vault specific
    locked: '#4A3D3D',
    unlocked: '#3D4A3D',
    duress: '#5A3D3D',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '600' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 22,
      fontWeight: '600' as const,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 18,
      fontWeight: '500' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
  },
};

export type Theme = typeof theme;
