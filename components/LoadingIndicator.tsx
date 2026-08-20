
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="brand-card brand-state">
      <div className="brand-spinner-shell">
        <div className="brand-spinner"></div>
      </div>
      <p className="brand-heading" style={{ marginTop: '20px' }}>Analyzing brand equity...</p>
      <p className="brand-copy" style={{ marginTop: '8px' }}>Generating evidence-aware brand insights...</p>
      <div className="brand-status-dots" aria-hidden="true">
        <div className="brand-status-dot"></div>
        <div className="brand-status-dot"></div>
        <div className="brand-status-dot"></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
