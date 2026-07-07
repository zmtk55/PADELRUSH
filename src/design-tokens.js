// Design Tokens for Padel Rush
// Extracted from tailwind.config.js for centralized theme management

export const tokens = {
  // Colors
  colors: {
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
    },
    secondary: {
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
    },
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))',
    },
    success: {
      DEFAULT: '#22c55e',
      foreground: '#ffffff',
    },
    warning: {
      DEFAULT: '#f59e0b',
      foreground: '#ffffff',
    },
    muted: {
      DEFAULT: 'hsl(var(--muted))',
      foreground: 'hsl(var(--muted-foreground))',
    },
    accent: {
      DEFAULT: 'hsl(var(--accent))',
      foreground: 'hsl(var(--accent-foreground))',
    },
    popover: {
      DEFAULT: 'hsl(var(--popover))',
      foreground: 'hsl(var(--popover-foreground))',
    },
    card: {
      DEFAULT: 'hsl(var(--card))',
      foreground: 'hsl(var(--card-foreground))',
    },
    sidebar: {
      DEFAULT: 'hsl(var(--sidebar))',
      foreground: 'hsl(var(--sidebar-foreground))',
      accent: 'hsl(var(--sidebar-accent))',
    },
  },
  
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    serif: ['Playfair Display', 'Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    heading: ['Oswald', 'Impact', 'sans-serif'],
    body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    score: ['JetBrains Mono', 'monospace'],
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',
    DEFAULT: '8px',
    md: '10px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
  },
  
  // Box Shadow
  boxShadow: {
    subtle: '0 1px 3px rgba(0,0,0,0.06)',
    card: '0 2px 8px rgba(0,0,0,0.06)',
    'card-hover': '0 8px 24px rgba(0,0,0,0.10)',
    elevated: '0 12px 32px rgba(0,0,0,0.12)',
    modal: '0 20px 60px rgba(0,0,0,0.15)',
    glow: '0 0 20px hsla(14, 100%, 58%, 0.15), 0 0 40px hsla(14, 100%, 58%, 0.05)',
    'glow-accent': '0 0 20px hsla(180, 100%, 42%, 0.15), 0 0 40px hsla(180, 100%, 42%, 0.05)',
  },
  
  // Keyframes and Animations (kept in CSS for now, but could be tokenized)
};

// Helper function to get token value with fallback
export const getToken = (path, defaultValue = null) => {
  const pathArray = path.split('.');
  let current = tokens;
  
  for (const key of pathArray) {
    if (current && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current !== null && current !== undefined ? current : defaultValue;
};

export default tokens;