import { generateImageResponse, calculateImageCreditCost } from '@libs/ai';
import type { ImageProviderName, ImageGenerationOptions } from '@libs/ai';
import { auth } from '@libs/auth';
import { creditService, TransactionTypeCode } from '@libs/credits';

// Allow longer timeout for image generation
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Get user session for credit tracking
    const sessionHeaders = new Headers(req.headers);
    const session = await auth.api.getSession({
      headers: sessionHeaders
    });
    
    // userId should always exist since middleware ensures authentication
    const userId = session?.user?.id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const body = await req.json();
    
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
    } = body;
    
    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'invalid_prompt', message: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check credit balance
    const creditBalance = await creditService.getBalance(userId);
    const creditCost = calculateImageCreditCost({ provider, model });
    
    if (creditBalance < creditCost) {
      return new Response(
        JSON.stringify({ 
          error: 'insufficient_credits',
          message: 'Not enough credits for image generation.',
          required: creditCost,
          balance: creditBalance
        }), 
        { 
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('Image generation request:', { 
      provider,
      model,
      size: provider === 'fal' ? undefined : size,
      aspectRatio: provider === 'fal' ? aspectRatio : undefined,
      userId,
      creditBalance,
      creditCost
    });
    
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
    };
    
    // Generate image
    const result = await generateImageResponse(options);
    
    // Consume credits after successful generation
    const consumeResult = await creditService.consumeCredits({
      userId,
      amount: creditCost,
      description: TransactionTypeCode.AI_IMAGE_GENERATION,
      metadata: {
        provider: result.provider,
        model: result.model,
        width: result.width,
        height: result.height,
      }
    });
    
    if (!consumeResult.success) {
      console.warn('Credit consumption failed:', consumeResult.error);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        credits: {
          consumed: creditCost,
          remaining: creditBalance - creditCost
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Image generation API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: 'generation_failed',
        message: errorMessage 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
