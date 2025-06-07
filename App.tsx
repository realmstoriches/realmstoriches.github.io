
import React, { useState, useCallback, useEffect } from 'react';
import { WorkflowStep, WebsiteFormData, GeneratedSiteData } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import StepIndicator from './components/StepIndicator';
import WorkflowForm from './components/WorkflowForm';
import ProcessingView from './components/ProcessingView';
import PaymentView from './components/PaymentView';
import DownloadView from './components/DownloadView';
import { generateWebsiteConcept } from './services/geminiService';
import { ErrorIcon, CheckCircleIcon } from './components/Icons';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.FORM_INPUT);
  const [formData, setFormData] = useState<WebsiteFormData | null>(null);
  const [generatedSiteData, setGeneratedSiteData] = useState<GeneratedSiteData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);

  const handleFormSubmit = useCallback((data: WebsiteFormData) => {
    setFormData(data);
    setCurrentStep(WorkflowStep.AI_PROCESSING);
    setError(null);
  }, []);

  const processWebsiteConcept = useCallback(async () => {
    if (!formData) return;

    setIsLoading(true);
    setError(null);
    try {
      const concept = await generateWebsiteConcept(formData);
      setGeneratedSiteData(concept);
      setCurrentStep(WorkflowStep.PAYMENT);
    } catch (err) {
      console.error("Error generating website concept:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during AI processing.");
      setCurrentStep(WorkflowStep.FORM_INPUT); // Revert to form on error
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    if (currentStep === WorkflowStep.AI_PROCESSING && formData) {
      processWebsiteConcept();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, formData]); // processWebsiteConcept is memoized

  const handlePaymentSuccess = useCallback(() => {
    setPaymentConfirmed(true);
    // Simulate a brief delay for payment confirmation
    setTimeout(() => {
      setCurrentStep(WorkflowStep.DOWNLOAD);
      setError(null);
    }, 1500);
  }, []);

  const handleStartOver = useCallback(() => {
    setCurrentStep(WorkflowStep.FORM_INPUT);
    setFormData(null);
    setGeneratedSiteData(null);
    setIsLoading(false);
    setError(null);
    setPaymentConfirmed(false);
  }, []);
  
  const renderCurrentStepView = () => {
    switch (currentStep) {
      case WorkflowStep.FORM_INPUT:
        return <WorkflowForm onSubmit={handleFormSubmit} initialData={formData} error={error} />;
      case WorkflowStep.AI_PROCESSING:
        return <ProcessingView message="Our AI is crafting your website concept..." />;
      case WorkflowStep.PAYMENT:
        if (paymentConfirmed) {
           return (
            <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg shadow-md">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-green-700 mb-2">Payment Confirmed!</h2>
              <p className="text-gray-600">Redirecting to download page...</p>
            </div>
          );
        }
        return generatedSiteData ? (
          <PaymentView
            siteName={generatedSiteData.siteName}
            onPaymentSuccess={handlePaymentSuccess}
            isLoading={isLoading}
          />
        ) : (
          <ProcessingView message="Preparing payment details..." /> // Fallback if data not ready
        );
      case WorkflowStep.DOWNLOAD:
        return generatedSiteData ? (
          <DownloadView siteData={generatedSiteData} onStartOver={handleStartOver} />
        ) : (
           <div className="text-center p-6">
            <p className="text-red-500">Could not load website data for download.</p>
            <button 
              onClick={handleStartOver}
              className="mt-4 bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              Start Over
            </button>
          </div>
        );
      default:
        return <p>Unknown step.</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} />
        {isLoading && currentStep !== WorkflowStep.AI_PROCESSING && currentStep !== WorkflowStep.PAYMENT && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin-slow rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          </div>
        )}
         {error && currentStep === WorkflowStep.FORM_INPUT && (
          <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center animate-fadeIn">
            <ErrorIcon className="w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold">Oops! Something went wrong.</p>
              <p>{error}</p>
            </div>
          </div>
        )}
        <div className="mt-8 animate-fadeIn">
          {renderCurrentStepView()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
    