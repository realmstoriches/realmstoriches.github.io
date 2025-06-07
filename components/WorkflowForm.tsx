
import React, { useState } from 'react';
import { WebsiteFormData } from '../types';
import Input from './Input';
import TextArea from './TextArea';
import Button from './Button';
import Card from './Card';
import { ErrorIcon } from './Icons';

interface WorkflowFormProps {
  onSubmit: (data: WebsiteFormData) => void;
  initialData?: WebsiteFormData | null;
  error?: string | null;
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({ onSubmit, initialData, error }) => {
  const [formData, setFormData] = useState<WebsiteFormData>(initialData || {
    siteName: '',
    siteType: 'Blog',
    primaryGoal: '',
    targetAudience: '',
    keyFeatures: '',
    stylePreference: 'Modern',
  });
  const [formErrors, setFormErrors] = useState<Partial<WebsiteFormData>>({});

  const siteTypes = ['Blog', 'E-commerce', 'Portfolio', 'Business', 'Landing Page', 'Community Forum', 'Educational Platform'];
  const stylePreferences = ['Modern', 'Minimalist', 'Playful', 'Corporate', 'Elegant', 'Rustic', 'Techy'];


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof WebsiteFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<WebsiteFormData> = {};
    if (!formData.siteName.trim()) errors.siteName = 'Site name is required.';
    if (!formData.primaryGoal.trim()) errors.primaryGoal = 'Primary goal is required.';
    if (!formData.targetAudience.trim()) errors.targetAudience = 'Target audience is required.';
    if (!formData.keyFeatures.trim()) errors.keyFeatures = 'Key features are required.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card title="Describe Your Dream Website" className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="my-4 p-3 bg-red-800/50 border border-red-700 text-red-200 rounded-md flex items-center">
            <ErrorIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        <Input
          label="Website Name"
          name="siteName"
          value={formData.siteName}
          onChange={handleChange}
          placeholder="e.g., My Awesome Project"
          error={formErrors.siteName}
          required
        />

        <div>
          <label htmlFor="siteType" className="block text-sm font-medium text-gray-300 mb-1">
            Website Type
          </label>
          <select
            id="siteType"
            name="siteType"
            value={formData.siteType}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors duration-150"
          >
            {siteTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <Input
          label="Primary Goal"
          name="primaryGoal"
          value={formData.primaryGoal}
          onChange={handleChange}
          placeholder="e.g., Sell handmade crafts, Share travel stories"
          error={formErrors.primaryGoal}
          required
        />
        <Input
          label="Target Audience"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleChange}
          placeholder="e.g., Young professionals, Small business owners"
          error={formErrors.targetAudience}
          required
        />
        <TextArea
          label="Key Features (one per line)"
          name="keyFeatures"
          value={formData.keyFeatures}
          onChange={handleChange}
          placeholder="e.g., User accounts&#10;Blog section&#10;Photo gallery"
          error={formErrors.keyFeatures}
          required
        />
        
        <div>
          <label htmlFor="stylePreference" className="block text-sm font-medium text-gray-300 mb-1">
            Preferred Style / Vibe
          </label>
          <select
            id="stylePreference"
            name="stylePreference"
            value={formData.stylePreference}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors duration-150"
          >
            {stylePreferences.map(style => <option key={style} value={style}>{style}</option>)}
          </select>
        </div>

        <Button type="submit" fullWidth>
          Generate My Website Concept
        </Button>
      </form>
    </Card>
  );
};

export default WorkflowForm;
    