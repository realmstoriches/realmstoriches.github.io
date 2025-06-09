
import React, { useState, useCallback } from 'react';
import { UserInputForm } from './components/UserInputForm';
import { TemplatePreview } from './components/TemplatePreview';
import { CartDisplay } from './components/CartDisplay';
import { CheckoutStep } from './components/CheckoutStep';
import { DownloadSection } from './components/DownloadSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { generateWebsiteTemplate } from './services/geminiService';
import { AppStep, type UserPreferences, type GeneratedTemplate } from './types';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.FORM);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<GeneratedTemplate[]>([]);

  const handleFormSubmit = useCallback(async (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setIsLoading(true);
    setError(null);
    setGeneratedTemplate(null);
    try {
      const htmlContent = await generateWebsiteTemplate(preferences);
      const newTemplate = {
        id: Date.now().toString(),
        name: `Website for ${preferences.topic || 'General Use'}`,
        htmlContent: htmlContent,
        preferences: preferences,
      };
      setGeneratedTemplate(newTemplate);
      setCurrentStep(AppStep.PREVIEW);
    } catch (err) {
      console.error("Error generating template:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during template generation.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (userPreferences) {
      handleFormSubmit(userPreferences);
    } else {
      setCurrentStep(AppStep.FORM); // Should not happen if regenerate is available
    }
  }, [userPreferences, handleFormSubmit]);

  const handleAddToCart = useCallback(() => {
    if (generatedTemplate) {
      setCart(prevCart => [...prevCart, generatedTemplate]);
      setCurrentStep(AppStep.CART);
    }
  }, [generatedTemplate]);
  
  const handleProceedToCheckout = useCallback(() => {
    if (cart.length > 0) {
      setCurrentStep(AppStep.CHECKOUT);
    } else {
      setError("Your cart is empty."); // Should ideally not happen
    }
  }, [cart]);

  const handleConfirmPurchase = useCallback(() => {
    // Simulate payment processing
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(AppStep.DOWNLOAD);
    }, 1500); // Simulate network delay
  }, []);

  const handleStartOver = useCallback(() => {
    setCurrentStep(AppStep.FORM);
    setUserPreferences(null);
    setGeneratedTemplate(null);
    // setCart([]); // Option to clear cart or not
    setError(null);
  }, []);

  const renderStep = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) {
      return (
        <div className="text-center p-8">
          <p className="text-red-400 text-xl mb-4">Error: {error}</p>
          <button
            onClick={currentStep === AppStep.PREVIEW && userPreferences ? handleRegenerate : handleStartOver}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            {currentStep === AppStep.PREVIEW && userPreferences ? "Try Generating Again" : "Start Over"}
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case AppStep.FORM:
        return <UserInputForm onSubmit={handleFormSubmit} initialValues={userPreferences} />;
      case AppStep.PREVIEW:
        if (!generatedTemplate) return <p>No template generated yet.</p>; // Should not happen
        return (
          <TemplatePreview
            htmlContent={generatedTemplate.htmlContent}
            onRegenerate={handleRegenerate}
            onAddToCart={handleAddToCart}
            onGoBack={handleStartOver}
          />
        );
      case AppStep.CART:
        return (
          <CartDisplay 
            cart={cart} 
            onProceedToCheckout={handleProceedToCheckout} 
            onContinueShopping={handleStartOver}
          />
        );
      case AppStep.CHECKOUT:
        return (
          <CheckoutStep 
            cart={cart}
            onConfirmPurchase={handleConfirmPurchase}
            onGoBack={() => setCurrentStep(AppStep.CART)}
          />
        );
      case AppStep.DOWNLOAD:
        if (!cart.length) return <p>No items purchased.</p>; // Should not happen
        return (
          <DownloadSection 
            purchasedItems={cart} 
            onGenerateNew={handleStartOver}
          />
        );
      default:
        return <UserInputForm onSubmit={handleFormSubmit} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderStep()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
