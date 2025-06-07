
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, name, error, className, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        className={`w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors duration-150 ${error ? 'border-red-500 ring-red-500' : ''} ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default TextArea;
    