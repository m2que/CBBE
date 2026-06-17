
import type { CBBEData, GeminiModelOption } from '../types';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '../lib/cbbe';

export { AVAILABLE_MODELS, DEFAULT_MODEL };

export const generateCBBEDashboard = async (brandName: string, model: GeminiModelOption = DEFAULT_MODEL): Promise<CBBEData> => {
  const response = await fetch('/api/cbbe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ brandName, model })
  });

  if (!response.ok) {
    throw new Error('Failed to generate dashboard');
  }

  return response.json();
};
