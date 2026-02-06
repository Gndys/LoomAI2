import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { config } from '@config'
import { auth } from '@libs/auth'
import { calculateImageCreditCost, evolinkCreateImageGenerationTask, evolinkGetTaskDetail } from '@libs/ai'
import type { EvolinkImageSize } from '@libs/ai/evolink'
import { creditService, TransactionTypeCode } from '@libs/credits'
import { createStorageProvider } from '@libs/storage'

export const maxDuration = 120

type GenerationMode = 'single' | 'three-view'
type SketchView = 'front' | 'side' | 'back'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const GENERATED_FOLDER = 'generated'

const VIEW_LABELS: Record<SketchView, string> = {
  front: 'front view',
  side: 'side view',
  back: 'back view',
}

const toAllowedSize = (value: unknown): EvolinkImageSize => {
  const fallback = (config.aiImage.defaults.size ?? 'auto') as EvolinkImageSize
  if (typeof value !== 'string') return fallback
  const allowed = new Set<EvolinkImageSize>(
    config.aiImage.evolinkSizes.map((item) => item.value as EvolinkImageSize)
  )
  if (allowed.has(value as EvolinkImageSize)) return value as EvolinkImageSize
  return fallback
}

const toGenerationMode = (value: unknown): GenerationMode => {
  return value === 'single' ? 'single' : 'three-view'
}

const toViews = (value: unknown, mode: GenerationMode): SketchView[] => {
  if (!Array.isArray(value)) {
    return mode === 'three-view' ? ['front', 'side', 'back'] : ['front']
  }

  const normalized = value.filter((item): item is SketchView => item === 'front' || item === 'side' || item === 'back')

  if (normalized.length === 0) {
    return mode === 'three-view' ? ['front', 'side', 'back'] : ['front']
  }

  const deduped = Array.from(new Set(normalized))
  if (mode === 'three-view' && deduped.length < 2) {
    return ['front', 'side', 'back']
  }

  return deduped
}

const buildPrompt = (mode: GenerationMode, views: SketchView[]) => {
  const viewsText = views.map((item) => VIEW_LABELS[item]).join(', ')

  if (mode === 'single') {
    return `
Convert the input garment image into a clean technical line sketch.
Requirements:
- Output black line art on a pure white background.
- No color, no shading, no texture, no fill.
- Focus on these requested views: ${viewsText}.
- Preserve silhouette, seam lines, topstitching, darts, panels, waistline, hems, and key garment structure.
- If multiple requested views are provided, arrange them clearly in one composition or output the dominant requested view.
- No text, logos, watermark, or borders.
`.trim()
  }

  return `
Convert the input garment image into technical line sketch multi-view output.
Requirements:
- Output black line art on a pure white background.
- No color, no shading, no texture, no fill.
- Generate the following views: ${viewsText}.
- Keep proportions consistent across views and maintain construction details.
- Preserve seam lines, topstitching, darts, panels, waistline, hems, and key structure.
- Prefer separate view blocks with clean spacing; if single canvas is used, keep each view clearly separated.
- No text, logos, watermark, or borders.
`.trim()
}

const sanitizeBaseName = (name?: string | null) => {
  if (!name) return 'generated'
  const base = name.replace(/\.[^/.]+$/, '')
  const sanitized = base.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return sanitized || 'generated'
}

const inferExtensionFromContentType = (contentType?: string | null) => {
  const normalized = (contentType || '').toLowerCase()
  if (normalized.includes('jpeg')) return 'jpg'
  if (normalized.includes('png')) return 'png'
  if (normalized.includes('webp')) return 'webp'
  if (normalized.includes('gif')) return 'gif'
  return 'png'
}

const persistGeneratedImage = async (imageUrl: string, userId: string, model: string) => {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status})`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const contentType = response.headers.get('content-type') || 'image/png'
  const baseName = sanitizeBaseName(`line-sketch-${model}`)
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const ext = inferExtensionFromContentType(contentType)
  const fileName = `${baseName}-${uniqueSuffix}.${ext}`

  const storage = createStorageProvider(config.storage.defaultProvider)
  const upload = await storage.uploadFile({
    file: buffer,
    fileName,
    contentType,
    folder: `uploads/${userId}/${GENERATED_FOLDER}`,
    metadata: {
      source: 'clothes-original-sketch',
      model,
      originalUrl: imageUrl,
    },
  })

  const signed = await storage.generateSignedUrl({
    key: upload.key,
    expiresIn: 3600,
    operation: 'get',
  })

  return {
    url: signed.url,
    key: upload.key,
    provider: config.storage.defaultProvider,
    expiresAt: signed.expiresAt,
    originalImageUrl: imageUrl,
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : ''

    if (!imageUrl) {
      return NextResponse.json({ error: 'invalid_image_url', message: 'imageUrl is required' }, { status: 400 })
    }

    const allowedModels = new Set(config.aiImage.availableModels.evolink)
    const model =
      typeof body?.model === 'string' && allowedModels.has(body.model)
        ? body.model
        : config.aiImage.defaultModels.evolink
    const mode = toGenerationMode(body?.mode)
    const views = toViews(body?.views, mode)
    const size = toAllowedSize(body?.size)
    const prompt = buildPrompt(mode, views)

    const creditBalance = await creditService.getBalance(userId)
    const creditCost = calculateImageCreditCost({ model })

    if (creditBalance < creditCost) {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          message: 'Not enough credits for line sketch generation.',
          required: creditCost,
          balance: creditBalance,
        },
        { status: 402 }
      )
    }

    const consumeResult = await creditService.consumeCredits({
      userId,
      amount: creditCost,
      description: TransactionTypeCode.AI_IMAGE_GENERATION,
      metadata: {
        provider: 'evolink',
        model,
        feature: 'clothes-original-sketch',
        mode,
        views,
        size,
      },
    })

    if (!consumeResult.success) {
      return NextResponse.json(
        {
          error: 'credit_consumption_failed',
          message: consumeResult.error || 'Failed to consume credits. Please try again.',
          required: creditCost,
          balance: consumeResult.newBalance,
        },
        { status: 402 }
      )
    }

    let generatedUrl: string | null = null

    try {
      const task = await evolinkCreateImageGenerationTask({
        model,
        prompt,
        size,
        image_urls: [imageUrl],
      })

      const maxAttempts = 60
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const detail = await evolinkGetTaskDetail(task.id)
        if (detail.status === 'completed') {
          const resultUrl = detail.results?.[0]
          if (!resultUrl || typeof resultUrl !== 'string') {
            throw new Error('No image URL in Evolink response')
          }
          generatedUrl = resultUrl
          break
        }

        if (detail.status === 'failed') {
          throw new Error('Evolink task failed')
        }

        await sleep(1500)
      }

      if (!generatedUrl) {
        throw new Error('Evolink task timeout')
      }
    } catch (generationError) {
      try {
        await creditService.addCredits({
          userId,
          amount: creditCost,
          type: 'refund',
          description: 'Refund for failed line sketch generation',
          metadata: {
            originalTransactionId: consumeResult.transactionId,
            provider: 'evolink',
            model,
            feature: 'clothes-original-sketch',
            mode,
            views,
            size,
            error: generationError instanceof Error ? generationError.message : 'Unknown error',
          },
        })
      } catch (refundError) {
        console.error('CRITICAL: Failed to refund credits after sketch generation failure:', {
          userId,
          amount: creditCost,
          originalTransactionId: consumeResult.transactionId,
          refundError,
        })
      }

      throw generationError
    }

    let persisted: Awaited<ReturnType<typeof persistGeneratedImage>> | null = null
    try {
      persisted = await persistGeneratedImage(generatedUrl, userId, model)
    } catch (persistError) {
      console.error('Failed to persist generated sketch:', persistError)
    }

    const resolvedImageUrl = persisted?.url ?? generatedUrl

    return NextResponse.json(
      {
        success: true,
        data: {
          imageUrl: resolvedImageUrl,
          key: persisted?.key,
          provider: persisted?.provider,
          expiresAt: persisted?.expiresAt,
          originalImageUrl: persisted?.originalImageUrl ?? generatedUrl,
          model,
          size,
          mode,
          views,
          aiProvider: 'evolink',
        },
        credits: {
          consumed: creditCost,
          remaining: consumeResult.newBalance,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Clothes original sketch API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: 'generation_failed', message: errorMessage }, { status: 500 })
  }
}
