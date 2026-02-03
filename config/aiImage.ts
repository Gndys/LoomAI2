/**
 * AI Image Generation Configuration
 * Provider: evolink (Nano Banana)
 */

export const aiImageConfig = {
  /**
   * Default Image Provider
   * @type {'evolink'}
   */
  defaultProvider: 'evolink' as const,

  /**
   * Default Model for image generation
   */
  defaultModels: {
    evolink: 'gemini-2.5-flash-image',
  },

  /**
   * Available Image Models
   */
  availableModels: {
    evolink: ['gemini-2.5-flash-image', 'z-image-turbo'],
  },

  /**
   * Size options for Evolink (aspect ratios)
   */
  evolinkSizes: [
    { value: 'auto', label: 'auto' },
    { value: '1:1', label: '1:1' },
    { value: '1:2', label: '1:2' },
    { value: '2:3', label: '2:3' },
    { value: '2:1', label: '2:1' },
    { value: '3:2', label: '3:2' },
    { value: '4:3', label: '4:3' },
    { value: '3:4', label: '3:4' },
    { value: '16:9', label: '16:9' },
    { value: '9:16', label: '9:16' },
  ],

  /**
   * Default generation parameters
   */
  defaults: {
    size: 'auto',
  },
} as const;

// Type exports for external use
export type ImageProviderName = 'evolink';

/**
 * Get size/aspect ratio options for a provider
 */
export function getImageSizesForProvider(provider: ImageProviderName) {
  switch (provider) {
    case 'evolink': return aiImageConfig.evolinkSizes;
    default: return [];
  }
}
