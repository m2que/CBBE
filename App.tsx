
import React, { useState, useCallback } from 'react';
import { AVAILABLE_MODELS, DEFAULT_MODEL, generateCBBEDashboard } from './services/geminiService';
import type { CBBEData, GeminiModelOption } from './types';
import BrandInputForm from './components/BrandInputForm';
import DashboardDisplay from './components/DashboardDisplay';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorDisplay from './components/ErrorDisplay';
import { ChartBarIcon, ZapIcon } from './components/icons';

const App: React.FC = () => {
  const [brand, setBrand] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<CBBEData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<GeminiModelOption>(DEFAULT_MODEL);

  const handleAnalyzeBrand = useCallback(async (brandName: string, selectedModel: GeminiModelOption) => {
    if (!brandName) {
      setError('Please enter a brand name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDashboardData(null);
    setBrand(brandName);

    try {
      const data = await generateCBBEDashboard(brandName, selectedModel);
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate dashboard. The brand may not be well-known enough, or an API error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <ChartBarIcon className="h-10 w-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
              Brand Equity Dashboard
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Analyze brand strength using Keller's CBBE model, powered by Gemini. Enter a brand to generate its equity profile.
          </p>
        </header>

        <main>
          <BrandInputForm
            onSubmit={handleAnalyzeBrand}
            isLoading={isLoading}
            model={model}
            models={AVAILABLE_MODELS}
            onModelChange={setModel}
          />
          
          {isLoading && <LoadingIndicator />}
          {error && <ErrorDisplay message={error} />}
          
          {dashboardData ? (
            <DashboardDisplay data={dashboardData} />
          ) : (
             !isLoading && !error && (
              <div className="text-center mt-12 p-8 bg-gray-800/50 rounded-lg border border-gray-700">
                  <ZapIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-300">Ready to Analyze</h2>
                  <p className="text-gray-400 mt-2">Enter a well-known brand name above to see its Customer-Based Brand Equity profile.</p>
              </div>
            )
          )}
        </main>
      </div>
       <footer className="text-center mt-auto pt-8 text-gray-500 text-sm">
        <p>Powered by Google Gemini. Data is synthesized from public sources for illustrative purposes.</p>
      </footer>
    </div>
  );
};

export default App;
