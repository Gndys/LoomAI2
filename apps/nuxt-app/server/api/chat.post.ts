import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default defineLazyEventHandler(async () => {
  // Get runtime config for API keys
  const config = useRuntimeConfig()
  
  return defineEventHandler(async (event) => {
    // Only allow POST requests
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    try {
      // Read the request body
      const { messages, provider = 'openai', model = 'gpt-4o' } = await readBody(event)

      // Validate required fields
      if (!messages || !Array.isArray(messages)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Messages array is required'
        })
      }

      // Log the request for debugging
      console.log('Chat API request:', { 
        messageCount: messages.length, 
        provider, 
        model 
      })

      // Create provider instance based on the selected provider
      let aiProvider
      let aiModel

      switch (provider) {
        case 'openai':
          if (!config.openaiApiKey) {
            throw createError({
              statusCode: 500,
              statusMessage: 'OpenAI API key not configured'
            })
          }
          aiProvider = createOpenAI({
            apiKey: config.openaiApiKey,
          })
          aiModel = aiProvider(model)
          break
        
        // For demo purposes, we'll use OpenAI for all providers
        // In production, you would configure each provider separately
        case 'qwen':
        case 'deepseek':
        default:
          // Fallback to OpenAI for demo
          if (!config.openaiApiKey) {
            throw createError({
              statusCode: 500,
              statusMessage: 'OpenAI API key not configured'
            })
          }
          aiProvider = createOpenAI({
            apiKey: config.openaiApiKey,
          })
          aiModel = aiProvider('gpt-4o') // Use GPT-4o as fallback
          break
      }

      // Stream the response using AI SDK
      const result = streamText({
        model: aiModel,
        messages,
        maxTokens: 1000,
        temperature: 0.7,
      })

      // Return the streaming response
      return result.toDataStreamResponse()

    } catch (error: any) {
      console.error('Chat API error:', error)
      
      // Handle different types of errors
      if (error.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: {
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      })
    }
  })
}) 