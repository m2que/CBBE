
import type { CBBEData, GeminiModelOption, MarketOverview } from '../types';
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

export const generateMarketOverview = async (brandName: string, model: GeminiModelOption = DEFAULT_MODEL): Promise<MarketOverview> => {
  const response = await fetch('/api/market-overview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ brandName, model })
  });

  if (!response.ok) {
    throw new Error('Failed to generate market overview');
  }

  return response.json();
};
