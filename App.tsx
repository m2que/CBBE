
import React, { useState, useCallback, useEffect } from 'react';
import { AVAILABLE_MODELS, DEFAULT_MODEL, generateCBBEDashboard, generateMarketOverview } from './services/geminiService';
import type { CBBEData, GeminiModelOption, MarketOverview } from './types';
import BrandInputForm from './components/BrandInputForm';
import DashboardDisplay from './components/DashboardDisplay';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorDisplay from './components/ErrorDisplay';
import BrandIcon from './components/BrandIcon';
import BrandIconSprite from './components/BrandIconSprite';

const App: React.FC = () => {
  const [brand, setBrand] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<CBBEData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<GeminiModelOption>(DEFAULT_MODEL);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const handleRunNewAnalysis = useCallback(() => {
    setDashboardData(null);
    setError(null);
    setIsLoading(false);
    setElapsedSeconds(0);

    window.requestAnimationFrame(() => {
      document.getElementById('brand-input')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

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
      <BrandIconSprite />
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
            <DashboardDisplay data={dashboardData} onRunNewAnalysis={handleRunNewAnalysis} />
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
          <a
            className="brand-footer-button"
            href="https://forms.cloud.microsoft/r/BdSpx03G9i"
            target="_blank"
            rel="noreferrer"
          >
            Share feedback
          </a>
          <p className="brand-footer-copy">
            &copy; 2026 <a href="https://marketlearn.online" className="brand-inline-link">MarketLearn</a>. AI-assisted content &mdash; verify before implementation.
          </p>
          <p className="brand-footer-copy">
            <a href="mailto:marketlearn.online@gmail.com" className="brand-inline-link">Email us</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
