# AI provider / image integration touchpoints

## Chat/text providers
- Types: `libs/ai/types.ts` (AllProviderName, ChatProviderName, ProviderConfig)
- Env keys: `libs/ai/config.ts` (PROVIDER_ENV_KEYS)
- Provider factory: `libs/ai/providers.ts` (createOpenAICompatible / createOpenAI / createDeepSeek)
- Default/available models: `config/ai.ts`
- Chat API route: `apps/next-app/app/api/chat/route.ts`
- Env example: `env.example` (AI_PROVIDER + provider keys)

## Image providers (non-Evolink)
- Image pipeline: `libs/ai/image.ts`
- Image types: `libs/ai/types.ts` (ImageProviderName, ImageGenerationOptions)
- Default/available image models: `libs/ai/image.ts` + `config/aiImage.ts`

## Evolink image task flow (separate)
- Evolink wrapper: `libs/ai/evolink.ts`
- Image config: `config/aiImage.ts`
- Credits pricing: `config/credits.ts`
- Image API route: `apps/next-app/app/api/image-generate/route.ts`
