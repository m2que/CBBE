import { GoogleGenAI } from '@google/genai';
import { DEFAULT_MODEL, buildCBBEPrompt, parseCBBEResponse } from '../lib/cbbe';
import type { GeminiModelOption } from '../types';

type VercelRequest = {
  method?: string;
  body?: {
    brandName?: unknown;
    model?: unknown;
  };
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

const isGeminiModelOption = (value: unknown): value is GeminiModelOption => {
  return value === 'gemini-2.5-flash' || value === 'gemini-2.5-pro';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { brandName, model } = req.body ?? {};

  if (typeof brandName !== 'string' || !brandName.trim()) {
    return res.status(400).json({ error: 'Brand name is required' });
  }

  const selectedModel = isGeminiModelOption(model) ? model : DEFAULT_MODEL;

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: buildCBBEPrompt(brandName.trim()),
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      }
    });

    const verifiedSources = new Map<string, string>();
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    groundingChunks.forEach((chunk) => {
      if (chunk.web?.uri) {
        verifiedSources.set(chunk.web.uri, chunk.web.title || '');
      }
    });

    const data = parseCBBEResponse(response.text, verifiedSources, brandName.trim());
    return res.status(200).json(data);
  } catch (error) {
    console.error('CBBE generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate dashboard' });
  }
}
