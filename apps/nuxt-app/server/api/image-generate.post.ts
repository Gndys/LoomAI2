import { generateImageResponse, calculateImageCreditCost } from '@libs/ai'
import type { ImageProviderName, ImageGenerationOptions } from '@libs/ai'
import { creditService, TransactionTypeCode } from '@libs/credits'

export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by permissions middleware)
    const user = event.context.user
    
    // userId should always exist since middleware ensures authentication
    const userId = user?.id
    
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        data: {
          error: 'unauthorized',
          message: 'Authentication required'
        }
      })
    }

    // Read the request body
    const body = await readBody(event)
    
    const {
      prompt,
      provider = 'qwen',
      model,
      negativePrompt,
      size,
      aspectRatio,
      seed,
      promptExtend,
      watermark,
      numInferenceSteps,
      guidanceScale,
    } = body

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          error: 'invalid_prompt',
          message: 'Prompt is required'
        }
      })
    }

    // Check credit balance
    const creditBalance = await creditService.getBalance(userId)
    const creditCost = calculateImageCreditCost({ provider, model })
    
    if (creditBalance < creditCost) {
      throw createError({
        statusCode: 402,
        statusMessage: 'Payment Required',
        data: {
          error: 'insufficient_credits',
          message: 'Not enough credits for image generation.',
          required: creditCost,
          balance: creditBalance
        }
      })
    }

    console.log('Image generation request:', { 
      provider,
      model,
      size,
      userId,
      creditBalance,
      creditCost
    })

    // Consume credits BEFORE generation to prevent race conditions and free generations
    const consumeResult = await creditService.consumeCredits({
      userId,
      amount: creditCost,
      description: TransactionTypeCode.AI_IMAGE_GENERATION,
      metadata: {
        provider,
        model,
        prompt: prompt.trim().substring(0, 100), // Store truncated prompt for reference
      }
    })

    if (!consumeResult.success) {
      throw createError({
        statusCode: 402,
        statusMessage: 'Payment Required',
        data: {
          error: 'credit_consumption_failed',
          message: consumeResult.error || 'Failed to consume credits. Please try again.',
          required: creditCost,
          balance: consumeResult.newBalance
        }
      })
    }

    // Build generation options
    const options: ImageGenerationOptions = {
      prompt: prompt.trim(),
      provider: provider as ImageProviderName,
      model,
      negativePrompt,
      size,
      aspectRatio,
      seed,
      promptExtend,
      watermark,
      numInferenceSteps,
      guidanceScale,
    }

    // Generate image (credits already consumed)
    const result = await generateImageResponse(options)

    return {
      success: true,
      data: result,
      credits: {
        consumed: creditCost,
        remaining: consumeResult.newBalance  // Use actual balance from consumption result
      }
    }

  } catch (error: any) {
    console.error('Image generation API error:', error)
    
    // Handle different types of errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        error: 'generation_failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    })
  }
})
