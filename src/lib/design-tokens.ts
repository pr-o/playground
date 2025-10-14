export const designTokens = {
  color: {
    primary: '#6C63FF',
    primaryLight: '#F0EEFF',
    primaryDark: '#4F46E5',
    accent: '#FFAD60',
    success: '#4ADE80',
    danger: '#F87171',
    text: {
      primary: '#1F2933',
      secondary: '#52606D',
      muted: '#8292A2',
    },
    canvas: {
      default: '#F9F8F4',
      alt: '#FFFFFF',
      dark: '#1D1F21',
      gridLight: '#E4E9F2',
      gridDark: '#2F3136',
    },
    ui: {
      border: '#D9DEE7',
      panel: '#FFFFFF',
      panelMuted: '#F4F6FB',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radii: {
    sm: 6,
    md: 12,
    lg: 20,
    pill: 999,
  },
  shadow: {
    panel: '0px 4px 20px rgba(15, 23, 42, 0.12)',
    floating: '0px 8px 32px rgba(15, 23, 42, 0.18)',
  },
  font: {
    family: `'Virgil', 'Segoe UI', sans-serif`,
    size: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '22px',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
