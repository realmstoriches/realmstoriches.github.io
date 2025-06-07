
import React from 'react';
import { WorkflowStep } from '../types';
import { DocumentTextIcon, LightBulbIcon, CreditCardIcon, DownloadIcon, CheckCircleIconSolid } from './Icons';

interface StepIndicatorProps {
  currentStep: WorkflowStep;
}

const steps = [
  { id: WorkflowStep.FORM_INPUT, name: 'Define', Icon: DocumentTextIcon },
  { id: WorkflowStep.AI_PROCESSING, name: 'Generate', Icon: LightBulbIcon },
  { id: WorkflowStep.PAYMENT, name: 'Checkout', Icon: CreditCardIcon },
  { id: WorkflowStep.DOWNLOAD, name: 'Download', Icon: DownloadIcon },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-center space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <li key={step.name} className="relative flex-1">
            {index < currentStepIndex ? (
              // Completed step
              <div className="group flex flex-col sm:flex-row items-center w-full">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary group-hover:bg-blue-700">
                  <CheckCircleIconSolid className="w-6 h-6 text-white" />
                </span>
                <span className="hidden sm:block ml-2 text-sm font-medium text-gray-200 group-hover:text-white">{step.name}</span>
                 {index < steps.length - 1 && (
                  <div className="absolute top-1/2 left-full w-full h-0.5 bg-primary transform -translate-y-1/2 -translate-x-0 hidden sm:block" style={{ marginLeft: '0.5rem', marginRight: '0.5rem', width: 'calc(100% - 2.5rem - 1rem)' }}></div>
                )}
              </div>
            ) : index === currentStepIndex ? (
              // Current step
              <div className="flex flex-col sm:flex-row items-center w-full" aria-current="step">
                <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary bg-primary/20">
                  <step.Icon className="w-6 h-6 text-primary" />
                </span>
                <span className="hidden sm:block ml-2 text-sm font-medium text-primary">{step.name}</span>
                 {index < steps.length - 1 && (
                  <div className="absolute top-1/2 left-full w-full h-0.5 bg-gray-600 transform -translate-y-1/2 -translate-x-0 hidden sm:block" style={{ marginLeft: '0.5rem', marginRight: '0.5rem', width: 'calc(100% - 2.5rem - 1rem)' }}></div>
                )}
              </div>
            ) : (
              // Future step
              <div className="group flex flex-col sm:flex-row items-center w-full">
                <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-600 group-hover:border-gray-400">
                  <step.Icon className="w-6 h-6 text-gray-500 group-hover:text-gray-300" />
                </span>
                <span className="hidden sm:block ml-2 text-sm font-medium text-gray-500 group-hover:text-gray-300">{step.name}</span>
                 {index < steps.length - 1 && (
                  <div className="absolute top-1/2 left-full w-full h-0.5 bg-gray-600 transform -translate-y-1/2 -translate-x-0 hidden sm:block" style={{ marginLeft: '0.5rem', marginRight: '0.5rem', width: 'calc(100% - 2.5rem - 1rem)' }}></div>
                )}
              </div>
            )}
            <p className="sm:hidden text-xs text-center mt-1 w-full truncate {index === currentStepIndex ? 'text-primary' : 'text-gray-400'}">{step.name}</p>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;

    