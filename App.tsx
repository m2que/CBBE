
import React, { useState, useCallback } from 'react';
import { Pyramid } from 'lucide-react';
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#f7f1e7_48%,#f3ecdf_100%)] text-slate-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(15,118,110,0.14),transparent_26%)]"></div>
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-10 rounded-[28px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.9)] px-6 py-10 shadow-[0_24px_80px_rgba(61,41,20,0.12)] sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-[rgba(15,118,110,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">
                <ChartBarIcon className="h-4 w-4" />
                MarketLearn Featured Tool
              </div>
              <div>
                <a
                  href="https://marketlearn.online"
                  className="inline-flex items-center rounded-full border border-[rgba(15,118,110,0.18)] bg-[rgba(255,252,247,0.9)] px-4 py-2 text-sm font-medium text-teal-800 shadow-[0_10px_24px_rgba(61,41,20,0.06)] transition hover:-translate-y-px hover:border-[rgba(15,118,110,0.3)] hover:text-teal-900"
                >
                  Back to MarketLearn
                </a>
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                Customer-Based Brand Equity (CBBE) Model
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Evaluate brand strength with detailed score drivers, strategic interpretation, and references. The linked industry reports, business news, and academic articles may be used to support reports and business plans.
              </p>
            </div>
            <div className="max-w-sm rounded-[22px] border border-[rgba(15,118,110,0.12)] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(250,244,235,0.96))] p-5 shadow-[0_16px_40px_rgba(61,41,20,0.08)]">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(15,118,110,0.08)] text-teal-800">
                <Pyramid className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">How to use it</p>
              <p className="mt-3 font-serif text-2xl font-semibold text-slate-900">Reports, case studies, and presentations</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Start with one brand, see the score logic, then turn the findings into evidence for reports and business plans.
              </p>
            </div>
          </div>
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
              <div className="mt-12 rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.9)] p-8 text-center shadow-[0_24px_80px_rgba(61,41,20,0.12)]">
                  <ZapIcon className="mx-auto mb-4 h-12 w-12 text-amber-600" />
                  <h2 className="font-serif text-3xl font-semibold text-slate-900">Ready to Analyze</h2>
                  <p className="mt-3 text-slate-600">Enter a well-known brand above to generate a structured CBBE profile with score explanations and references.</p>
               </div>
            )
          )}
        </main>
      </div>
       <footer className="mt-auto pt-8 text-center text-sm text-slate-500">
        <p>
          &copy; 2026{' '}
          <a href="https://marketlearn.online" className="font-medium text-teal-800 underline decoration-[rgba(15,118,110,0.35)] underline-offset-4 transition hover:text-teal-900">
            MarketLearn
          </a>
          . AI-assisted content &mdash; verify before implementation.
        </p>
         <p className="mt-2">
           Contact:{' '}
           <a href="mailto:marketlearn.online@gmail.com" className="font-medium text-teal-800 underline decoration-[rgba(15,118,110,0.35)] underline-offset-4 transition hover:text-teal-900">
            marketlearn.online@gmail.com
          </a>
        </p>
       </footer>
    </div>
  );
};

export default App;
