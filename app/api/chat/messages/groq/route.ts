import { OpenAIStream, StreamingTextResponse } from 'ai';
import Groq from 'groq-sdk';

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

    const groq = new Groq({
        apiKey: config.provider?.apiKey ?? process.env.GROQ_API_KEY ?? '',
    });

    if (config.stream) {
        const response = await groq.chat.completions.create({
            model: config.model.model_id,
            stream: true,
            messages,
        });
        const output = OpenAIStream(response);
        return new StreamingTextResponse(output);
    } else {
        const response = await groq.chat.completions.create({
            model: config.model.model_id,
            stream: false,
            messages,
        });
        return new Response(JSON.stringify({ content: response.choices[0].message.content }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
