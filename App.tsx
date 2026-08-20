
import React, { useState, useCallback } from 'react';
import { AVAILABLE_MODELS, DEFAULT_MODEL, generateCBBEDashboard } from './services/geminiService';
import type { CBBEData, GeminiModelOption } from './types';
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
    <div className="brand-app">
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
            <nav className="nav" aria-label="Page sections">
              <a className="brand-nav-link" href="#analyze">Analyze</a>
              <a className="brand-nav-link" href="#dashboard">Dashboard</a>
              <a className="brand-nav-link" href="#references">References</a>
            </nav>
          </div>
        </header>

        <section className="brand-card brand-hero">
          <div className="brand-hero-copy">
            <h1 className="brand-title">Customer-Based Brand Equity (CBBE) Model</h1>
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
          
          {isLoading && <LoadingIndicator />}
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
