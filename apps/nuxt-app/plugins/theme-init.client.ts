// Client-side plugin to immediately apply theme and prevent flash
import { config } from '@config'
import { initializeThemeImmediate } from '@libs/ui/themes'

export default defineNuxtPlugin(() => {
  // This runs as early as possible on the client
  if (import.meta.client) {
    initializeThemeImmediate(
      config.app.theme.storageKey,
      config.app.theme.defaultTheme,
      config.app.theme.defaultColorScheme
    )
  }
}) 