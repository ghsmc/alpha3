import { AnthropicStream, StreamingTextResponse } from 'ai';
import Anthropic from '@anthropic-ai/sdk';

import { ApiConfig } from '@/types/app';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const {
        messages,
        config,
        stream,
    }: {
        messages: any[];
        config: ApiConfig;
        stream: boolean;
    } = await req.json();

    const anthropic = new Anthropic({
        apiKey: config.provider?.apiKey ?? process.env.ANTHROPIC_API_KEY ?? '',
    });

    if (config.stream) {
        const response = await anthropic.messages.create({
            messages,
            model: config.model.model_id,
            stream: true,
            max_tokens: 4096,
        });
        const output = AnthropicStream(response);
        return new StreamingTextResponse(output);
    } else {
        const response = await anthropic.messages.create({
            messages,
            model: config.model.model_id,
            stream: false,
            max_tokens: 4096,
        });
        return new Response(JSON.stringify({ content: response.content[0].text }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
