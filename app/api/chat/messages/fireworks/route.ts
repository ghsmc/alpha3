import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

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

    const fireworks = new OpenAI({
        apiKey: config.provider?.apiKey ?? process.env.FIREWORKS_API_KEY ?? '',
        baseURL: config.provider?.endpoint ?? process.env.FIREWORKS_API_ENDPOINT ?? 'https://api.fireworks.ai/inference/v1',
    });

    if (config.stream) {
        const response = await fireworks.chat.completions.create({
            model: config.model.model_id,
            stream: true,
            max_tokens: 1000,
            messages,
        });
        const output = OpenAIStream(response);
        return new StreamingTextResponse(output);
    } else {
        const response = await fireworks.chat.completions.create({
            model: config.model.model_id,
            stream: false,
            max_tokens: 1000,
            messages,
        });
        return new Response(JSON.stringify({ content: response.choices[0].message.content }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
