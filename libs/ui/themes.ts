// Theme management module for consistent theme handling across the application
export type Theme = 'light' | 'dark'
export type ColorScheme = 'default' | 'claude' | 'cosmic-night' | 'modern-minimal' | 'ocean-breeze'

export interface ThemeState {
  theme: Theme
  colorScheme: ColorScheme
}

// Available themes configuration
export const THEMES: readonly Theme[] = ['light', 'dark'] as const
export const COLOR_SCHEMES: readonly ColorScheme[] = [
  'default',
  'claude', 
  'cosmic-night',
  'modern-minimal',
  'ocean-breeze'
] as const

// Theme class mappings
export const THEME_CLASSES = {
  light: '',  // light is default, no class needed
  dark: 'dark',
} as const

export const COLOR_SCHEME_CLASSES = {
  default: '',  // default doesn't need a class
  claude: 'theme-claude',
  'cosmic-night': 'theme-cosmic-night',
  'modern-minimal': 'theme-modern-minimal',
  'ocean-breeze': 'theme-ocean-breeze',
} as const

// All possible theme-related classes for cleanup
export const ALL_THEME_CLASSES = [
  'light', 
  'dark',
  'theme-default',
  'theme-claude',
  'theme-cosmic-night', 
  'theme-modern-minimal',
  'theme-ocean-breeze'
] as const

/**
 * Apply theme classes to document root
 * @param theme - Theme mode (light/dark)
 * @param colorScheme - Color scheme
 */
export function applyThemeToDocument(theme: Theme, colorScheme: ColorScheme): void {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Remove all existing theme classes
  root.classList.remove(...ALL_THEME_CLASSES)
  
  // Apply theme class (only dark needs explicit class)
  if (theme === 'dark') {
    root.classList.add(THEME_CLASSES.dark)
  }
  
  // Apply color scheme class (default doesn't need a class)
  if (colorScheme !== 'default') {
    root.classList.add(COLOR_SCHEME_CLASSES[colorScheme])
  }
}

/**
 * Get theme state from localStorage
 * @param storageKey - Storage key for theme preferences
 * @returns ThemeState or null if not found/invalid
 */
export function getStoredThemeState(storageKey: string): ThemeState | null {
  if (typeof localStorage === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return null
    
    const parsed = JSON.parse(stored) as ThemeState
    
    // Validate stored values
    if (THEMES.includes(parsed.theme) && COLOR_SCHEMES.includes(parsed.colorScheme)) {
      return parsed
    }
    
    return null
  } catch (error) {
    console.warn('Failed to parse stored theme preferences:', error)
    return null
  }
}

/**
 * Save theme state to localStorage
 * @param storageKey - Storage key for theme preferences
 * @param themeState - Theme state to save
 */
export function saveThemeState(storageKey: string, themeState: ThemeState): void {
  if (typeof localStorage === 'undefined') return
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(themeState))
  } catch (error) {
    console.warn('Failed to save theme preference to localStorage:', error)
  }
}

/**
 * Initialize theme immediately (for preventing flash)
 * This should be called as early as possible, preferably in <head>
 * @param storageKey - Storage key for theme preferences
 * @param defaultTheme - Default theme from config
 * @param defaultColorScheme - Default color scheme from config
 */
export function initializeThemeImmediate(
  storageKey: string,
  defaultTheme: Theme,
  defaultColorScheme: ColorScheme
): ThemeState {
  // Try to get stored preferences first
  const stored = getStoredThemeState(storageKey)
  
  const themeState: ThemeState = stored || {
    theme: defaultTheme,
    colorScheme: defaultColorScheme
  }
  
  // Apply theme immediately
  applyThemeToDocument(themeState.theme, themeState.colorScheme)
  
  // Save defaults if no stored preferences found
  if (!stored) {
    saveThemeState(storageKey, themeState)
  }
  
  return themeState
} 