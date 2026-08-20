
import React from 'react';
import BrandIcon from './BrandIcon';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="brand-alert" role="alert">
      <div className="brand-alert-row">
        <div>
          <BrandIcon name="icon-bea" />
        </div>
        <div>
          <p className="brand-alert-title">An error occurred</p>
          <p className="brand-copy-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
