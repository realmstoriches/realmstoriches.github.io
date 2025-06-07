
import React from 'react';
import { LightBulbIcon } from './Icons';

interface ProcessingViewProps {
  message?: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ message = "Processing, please wait..." }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800 shadow-xl rounded-xl max-w-md mx-auto">
      <div className="relative mb-6">
        <LightBulbIcon className="w-20 h-20 text-primary opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-24 w-24 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-gray-100 mb-2">Working our Magic!</h2>
      <p className="text-gray-400">{message}</p>
      <div className="w-full bg-slate-700 rounded-full h-2.5 mt-6 overflow-hidden">
        <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
      </div>
    </div>
  );
};

export default ProcessingView;
    