import { streamResponse } from '@libs/ai'

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    // Read the request body
    const { messages, provider, model } = await readBody(event)

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
      provider: provider || 'openai', 
      model: model || 'gpt-5' 
    })

    // Use the streamResponse function from libs/ai
    return streamResponse({
      messages,
      provider: provider || undefined,
      model: model || undefined
    })

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