
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="text-center p-8 my-8">
      <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse delay-0"></div>
        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse delay-200"></div>
        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse delay-400"></div>
      </div>
      <p className="mt-4 text-gray-400">Generating brand insights...</p>
    </div>
  );
};

export default LoadingIndicator;
