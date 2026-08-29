
import React from 'react';

interface LoadingIndicatorProps {
  elapsedSeconds: number;
  title?: string;
  description?: string;
  note?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  elapsedSeconds,
  title = 'Analyzing brand equity...',
  description = 'Generating evidence-aware brand insights...',
  note = 'Be patient - analysis is running and needs a minute or so.'
}) => {
  const minuteText = elapsedSeconds >= 60 ? `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s` : `${elapsedSeconds}s`;

  return (
    <div className="brand-card brand-state">
      <div className="brand-spinner-shell">
        <div className="brand-spinner"></div>
      </div>
      <p className="brand-heading" style={{ marginTop: '20px' }}>{title}</p>
      <p className="brand-copy" style={{ marginTop: '8px' }}>{description}</p>
      <p className="brand-copy-sm" style={{ marginTop: '8px' }}>Elapsed time: {minuteText}</p>
      <p className="brand-copy-sm" style={{ marginTop: '6px' }}>{note}</p>
      <div className="brand-status-dots" aria-hidden="true">
        <div className="brand-status-dot"></div>
        <div className="brand-status-dot"></div>
        <div className="brand-status-dot"></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
