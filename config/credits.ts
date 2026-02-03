/**
 * Credits System Configuration
 * Token-based consumption model for AI and other features
 */

/**
 * Fixed consumption config type
 * Can be a simple number or an object with default and model-specific costs
 */
export type FixedConsumptionConfig = number | {
  default: number;
  models?: Record<string, number>;
};

export const creditsConfig = {
  /**
   * Consumption mode: 'fixed' or 'dynamic'
   * - fixed: Each operation consumes a fixed amount of credits
   * - dynamic: Credits consumed based on actual token usage
   */
  consumptionMode: 'dynamic' as 'fixed' | 'dynamic',

  /**
   * Fixed consumption amounts (used when consumptionMode is 'fixed')
   * 
   * Each entry can be:
   * - A number: Simple fixed cost for all operations
   * - An object: { default: number, models?: { modelName: number } }
   */
  fixedConsumption: {
    /**
     * AI Chat Credits
     * Simple number = same cost for all models
     * Object = model-specific pricing
     */
    aiChat: 1 as FixedConsumptionConfig,

    /**
     * AI Image Generation Credits
     * Model names are globally unique, so no need to nest by provider
     */
    aiImage: {
      default: 10,
      models: {
        // Evolink Nano Banana
        'gemini-2.5-flash-image': 10,
        // Evolink Z Image Turbo
        'z-image-turbo': 10,
      },
    } as FixedConsumptionConfig,
  },

  /**
   * Dynamic consumption settings (used when consumptionMode is 'dynamic')
   */
  dynamicConsumption: {
    // Tokens to credits conversion ratio
    tokensPerCredit: 1000,  // 1000 tokens = 1 credit

    /**
     * Model-specific multipliers (adjust pricing per model)
     * Base credit = tokens / tokensPerCredit
     * Final credit = Base * multiplier
     */
    modelMultipliers: {
      // Premium models cost more
      'gpt-4': 2.0,
      'gpt-4-turbo': 1.5,
      'qwen-max': 1.2,
      // Standard models
      'gpt-3.5-turbo': 1.0,
      'qwen-plus': 1.0,
      'deepseek-chat': 0.8,
      // Economy models
      'qwen-turbo': 0.5,
      // Default fallback
      'default': 1.0
    } as Record<string, number>
  }
} as const;

/**
 * Helper to resolve fixed consumption config to a number
 * @param config The fixed consumption config (number or object)
 * @param model Optional model name for model-specific pricing
 */
export function resolveFixedConsumption(
  config: FixedConsumptionConfig,
  model?: string
): number {
  // Simple number case
  if (typeof config === 'number') {
    return config;
  }
  
  // Object case: check model-specific pricing first
  if (model && config.models?.[model] !== undefined) {
    return config.models[model];
  }
  
  // Fall back to default
  return config.default;
}
