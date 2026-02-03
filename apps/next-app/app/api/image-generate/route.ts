import { calculateImageCreditCost } from '@libs/ai';
import { evolinkCreateImageGenerationTask, evolinkGetTaskDetail } from '@libs/ai/evolink';
import type { EvolinkImageSize } from '@libs/ai/evolink';
import { auth } from '@libs/auth';
import { creditService, TransactionTypeCode } from '@libs/credits';
import { config } from '@config';

// Allow longer timeout for async image generation
export const maxDuration = 120;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toOptionalSize = (value: unknown): EvolinkImageSize | undefined => {
  if (typeof value !== 'string') return undefined;
  const allowed = new Set(config.aiImage.evolinkSizes.map((item) => item.value));
  return allowed.has(value) ? (value as EvolinkImageSize) : undefined;
};

const toImageUrls = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const urls = value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  const limited = urls.slice(0, 5);
  return limited.length ? limited : undefined;
};

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
    
    const body = await req.json().catch(() => ({}));
    
    const prompt = body?.prompt;
    const allowedModels = new Set(config.aiImage.availableModels.evolink);
    const model =
      typeof body?.model === 'string' && allowedModels.has(body.model)
        ? body.model
        : config.aiImage.defaultModels.evolink;
    const size = toOptionalSize(body?.size) ?? config.aiImage.defaults.size;
    const imageUrls = toImageUrls(body?.image_urls ?? body?.imageUrls);
    
    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'invalid_prompt', message: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check credit balance
    const creditBalance = await creditService.getBalance(userId);
    const creditCost = calculateImageCreditCost({ model });
    
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
      provider: 'evolink',
      model,
      size,
      userId,
      creditBalance,
      creditCost
    });
    
    // Consume credits BEFORE generation to prevent race conditions and free generations
    const consumeResult = await creditService.consumeCredits({
      userId,
      amount: creditCost,
      description: TransactionTypeCode.AI_IMAGE_GENERATION,
      metadata: {
        provider: 'evolink',
        model,
        prompt: prompt.trim().substring(0, 100), // Store truncated prompt for reference
      }
    });
    
    if (!consumeResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'credit_consumption_failed',
          message: consumeResult.error || 'Failed to consume credits. Please try again.',
          required: creditCost,
          balance: consumeResult.newBalance
        }), 
        { 
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Generate image (credits already consumed)
    // If generation fails, we need to refund the credits
    let imageUrl: string | null = null;
    try {
      const task = await evolinkCreateImageGenerationTask({
        model: model as typeof config.aiImage.availableModels.evolink[number],
        prompt: prompt.trim(),
        size,
        image_urls: imageUrls,
      });

      const maxAttempts = 60;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const detail = await evolinkGetTaskDetail(task.id);
        if (detail.status === 'completed') {
          const resultUrl = detail.results?.[0];
          if (!resultUrl || typeof resultUrl !== 'string') {
            throw new Error('No image URL in Evolink response');
          }
          imageUrl = resultUrl;
          break;
        }
        if (detail.status === 'failed') {
          throw new Error('Evolink task failed');
        }
        await sleep(1500);
      }

      if (!imageUrl) {
        throw new Error('Evolink task timeout');
      }
    } catch (generationError) {
      // Refund credits on generation failure
      console.error('Image generation failed, refunding credits:', generationError);
      
      try {
        await creditService.addCredits({
          userId,
          amount: creditCost,
          type: 'refund',
          description: 'Refund for failed image generation',
          metadata: {
            originalTransactionId: consumeResult.transactionId,
            provider: 'evolink',
            model,
            error: generationError instanceof Error ? generationError.message : 'Unknown error',
          }
        });
        console.log('Credits refunded successfully:', { userId, amount: creditCost });
      } catch (refundError) {
        // Log refund failure for manual reconciliation
        console.error('CRITICAL: Failed to refund credits after generation failure:', {
          userId,
          amount: creditCost,
          originalTransactionId: consumeResult.transactionId,
          refundError
        });
      }
      
      throw generationError;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          imageUrl,
          model,
          provider: 'evolink',
        },
        credits: {
          consumed: creditCost,
          remaining: consumeResult.newBalance  // Use actual balance from consumption result
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
