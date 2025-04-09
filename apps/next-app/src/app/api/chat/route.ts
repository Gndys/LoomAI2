import { streamResponse } from '@libs/ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {

  const { messages, provider, model } = await req.json();
  console.log('req', messages, provider, model);
  return streamResponse({
    messages,
    provider, // extracted from request
    model     // extracted from request
  })
} 