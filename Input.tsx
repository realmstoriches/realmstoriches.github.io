
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, name, error, className, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors duration-150 ${error ? 'border-red-500 ring-red-500' : ''} ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
    