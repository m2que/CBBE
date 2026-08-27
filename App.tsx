
import React, { useState, useCallback, useEffect } from 'react';
import { AVAILABLE_MODELS, DEFAULT_MODEL, generateCBBEDashboard, generateMarketOverview } from './services/geminiService';
import type { CBBEData, GeminiModelOption, MarketOverview } from './types';
import BrandInputForm from './components/BrandInputForm';
import DashboardDisplay from './components/DashboardDisplay';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorDisplay from './components/ErrorDisplay';
import BrandIcon from './components/BrandIcon';

const App: React.FC = () => {
  const [brand, setBrand] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<CBBEData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<GeminiModelOption>(DEFAULT_MODEL);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLoading]);

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
      const [data, overview] = await Promise.all([
        generateCBBEDashboard(brandName, selectedModel),
        generateMarketOverview(brandName, selectedModel).catch(() => null)
      ]);

      setDashboardData({
        ...data,
        marketOverview: overview || data.marketOverview
      });
    } catch (err) {
      console.error(err);
      setError('Failed to generate dashboard. The brand may not be well-known enough, or an API error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="brand-app">
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }} aria-hidden="true">
        <symbol id="icon-marketlearn" viewBox="0 0 24 24">
          <path d="M12 20V10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M18 20V4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M6 20v-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        </symbol>
        <symbol id="icon-cbbe" viewBox="0 0 24 24">
          <path d="M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M12 2v20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
        </symbol>
        <symbol id="icon-bpm" viewBox="0 0 24 24">
          <path d="M12 23V1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M1 12h22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
        </symbol>
        <symbol id="icon-bea" viewBox="0 0 24 24">
          <path d="M12 0.6c1.18 2.92 2.92 5.05 4.7 7.22 1.82 2.22 3.68 4.5 3.68 7.34A8 8 0 0 1 12 23a8 8 0 0 1-8-7.84c0-2.84 1.86-5.12 3.68-7.34C9.08 5.65 10.82 3.52 12 0.6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
        </symbol>
      </svg>
      <div className="brand-page">
        <header className="topbar brand-topbar">
          <div className="shell topbar-inner">
            <a className="brand" href="https://marketlearn.online">
              <span className="brand-icon" aria-hidden="true">
                <BrandIcon name="icon-marketlearn" />
              </span>
              <span className="brand-copy">
                <span className="brand-mark">MarketLearn</span>
              </span>
            </a>
          </div>
        </header>

        <section className="brand-card brand-hero">
          <div className="brand-hero-copy">
            <p className="brand-microcopy">CBBE Analyzer</p>
            <h1 className="brand-title brand-hero-title">
              Customer-Based Brand Equity
            </h1>
            <p className="brand-copy">
              Evaluate brand strength with detailed brand equity breakdown and strategic interpretation. The analysis provides links to industry reports, business news, and academic articles to support your reports and business plans.
            </p>
          </div>
          <div className="brand-panel-stack">
            <div className="brand-panel brand-panel-tight">
              <div className="brand-icon-circle" aria-hidden="true">
                <BrandIcon name="icon-cbbe" style={{ width: '32px', height: '32px', display: 'block' }} />
              </div>
              <p className="brand-microcopy" style={{ color: 'var(--muted)' }}>How to use it</p>
              <h2 className="brand-heading">Enter a brand to get a score on</h2>
              <p className="brand-copy-sm">
                <strong>Brand Identity:</strong> creating awareness, recognition, and recall
              </p>
              <p className="brand-copy-sm">
                <strong>Brand Meaning:</strong> what the brand stands for through product performance and visual imagery
              </p>
              <p className="brand-copy-sm">
                <strong>Brand Response:</strong> how customers think and feel
              </p>
              <p className="brand-copy-sm">
                <strong>Brand Resonance:</strong> achieve loyalty, advocacy, and engagement
              </p>
            </div>
          </div>
        </section>

        <main className="brand-shell-stack" id="analyze">
          <BrandInputForm
            onAnalyzeClick={handleAnalyzeBrand}
            isLoading={isLoading}
            model={model}
            models={AVAILABLE_MODELS}
            onModelChange={setModel}
          />
          
          {isLoading && <LoadingIndicator elapsedSeconds={elapsedSeconds} />}
          {error && <ErrorDisplay message={error} />}
          
          {dashboardData ? (
            <DashboardDisplay data={dashboardData} />
          ) : (
             !isLoading && !error && (
              <div className="brand-card brand-state">
                  <div className="brand-icon-circle" aria-hidden="true" style={{ margin: '0 auto 16px' }}>
                    <BrandIcon name="icon-marketlearn" className="brand-inline-icon h-7 w-7" />
                  </div>
                  <h2 className="brand-heading brand-heading-lg">Ready to Analyze</h2>
                  <p className="brand-copy" style={{ marginTop: '12px' }}>Enter a well-known brand above to generate a structured CBBE profile with score explanations and references.</p>
                </div>
            )
          )}
        </main>
        <footer className="brand-footer">
          <p className="brand-footer-copy">
            &copy; 2026 <a href="https://marketlearn.online" className="brand-inline-link">MarketLearn</a>. AI-assisted content &mdash; verify before implementation.
          </p>
          <p className="brand-footer-copy">
            Contact: <a href="mailto:marketlearn.online@gmail.com" className="brand-inline-link">marketlearn.online@gmail.com</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
