// Enhanced theme composable for Nuxt with localStorage persistence and color scheme support
import { config } from '@config'
import { 
  type Theme, 
  type ColorScheme, 
  type ThemeState,
  applyThemeToDocument,
  getStoredThemeState,
  saveThemeState
} from '@libs/ui/themes'

// Global state - 确保所有组件使用相同的状态实例
const STORAGE_KEY = config.app.theme.storageKey
const theme = ref<Theme>(config.app.theme.defaultTheme)
const colorScheme = ref<ColorScheme>(config.app.theme.defaultColorScheme)
const isInitialized = ref(false)

export const useTheme = () => {
  
  // Initialize state from localStorage or use config defaults
  const initializeTheme = () => {
    if (!import.meta.client) return false
    
    const stored = getStoredThemeState(STORAGE_KEY)
    
    if (stored) {
      theme.value = stored.theme
      colorScheme.value = stored.colorScheme
      return true // Found stored preferences
    } else {
      // No stored preferences, keep config defaults and will save them
      return false // No stored preferences found
    }
  }
  
  // Apply theme classes to document
  const applyTheme = (saveToStorage = true) => {
    if (!import.meta.client) return
    
    // Apply theme to document
    applyThemeToDocument(theme.value, colorScheme.value)
    
    // Save to localStorage if requested
    if (saveToStorage && isInitialized.value) {
      saveThemeState(STORAGE_KEY, {
        theme: theme.value,
        colorScheme: colorScheme.value
      })
    }
  }
  
  // Theme setters
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }
  
  const setColorScheme = (newColorScheme: ColorScheme) => {
    colorScheme.value = newColorScheme
  }
  
  // Initialize only once
  if (import.meta.client && !isInitialized.value) {
    onMounted(() => {
      const hasStoredPreferences = initializeTheme()
      applyTheme(!hasStoredPreferences) // Save to localStorage if no stored preferences found
      isInitialized.value = true
      
      // Only set up watchers once
      nextTick(() => {
        // Watch for changes and apply them
        watch([theme, colorScheme], () => applyTheme(true), { immediate: false })
      })
    })
  }
  
  return {
    theme: readonly(theme),
    colorScheme: readonly(colorScheme),
    setTheme,
    setColorScheme
  }
}

// Export types for external use
export type { Theme, ColorScheme, ThemeState } 