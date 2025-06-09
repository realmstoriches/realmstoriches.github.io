
import React, { useState } from 'react';
import Button from './Button';
import Card from './Card';
import { CreditCardIcon, LockClosedIcon } from './Icons';

interface PaymentViewProps {
  siteName: string;
  onPaymentSuccess: () => void;
  isLoading: boolean;
}

const PaymentView: React.FC<PaymentViewProps> = ({ siteName, onPaymentSuccess, isLoading }) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePayment = () => {
    setIsProcessingPayment(true);
    // Simulate API call for payment
    setTimeout(() => {
      onPaymentSuccess();
      setIsProcessingPayment(false);
    }, 2000); // Simulate 2 second payment processing
  };

  return (
    <Card title="Secure Checkout" className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <CreditCardIcon className="w-16 h-16 text-primary mx-auto mb-3" />
        <h2 className="text-2xl font-semibold text-gray-100">Final Step!</h2>
        <p className="text-gray-400">
          Your AI-generated concept for <span className="font-semibold text-primary">{siteName}</span> is ready.
        </p>
        <p className="text-gray-400 mt-1">Proceed with a (simulated) payment to unlock it.</p>
      </div>

      <div className="bg-slate-700 p-6 rounded-lg shadow-inner mb-6">
        <h3 className="text-lg font-medium text-gray-200 mb-1">Order Summary</h3>
        <div className="flex justify-between items-center text-gray-300">
          <span>AI Website Concept Generation</span>
          <span className="font-semibold text-primary">$19.99 (Simulated)</span>
        </div>
        <hr className="my-3 border-slate-600" />
        <div className="flex justify-between items-center text-xl font-semibold text-gray-100">
          <span>Total</span>
          <span>$19.99</span>
        </div>
      </div>
      
      {/* Simulated Payment Form Placeholder */}
      <div className="space-y-4 mb-6">
        <div className="p-3 border border-slate-600 rounded-md bg-slate-700/50 text-sm text-gray-400">
          This is a <span className="font-semibold text-yellow-400">simulated payment</span>. No real card details are needed or processed.
        </div>
        <div className="flex items-center p-3 border border-slate-600 rounded-md bg-slate-700/50">
            <LockClosedIcon className="w-5 h-5 text-green-400 mr-2"/>
            <span className="text-sm text-green-300">Secure Connection (Simulated)</span>
        </div>
      </div>


      <Button onClick={handlePayment} isLoading={isLoading || isProcessingPayment} fullWidth variant="primary">
        {isProcessingPayment ? 'Processing Payment...' : 'Confirm & Pay $19.99 (Simulated)'}
      </Button>
      <p className="text-xs text-gray-500 text-center mt-4">
        By clicking, you agree to our (simulated) terms of service.
      </p>
    </Card>
  );
};

export default PaymentView;
    