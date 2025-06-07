
export enum WorkflowStep {
  FORM_INPUT = 'FORM_INPUT',
  AI_PROCESSING = 'AI_PROCESSING',
  PAYMENT = 'PAYMENT',
  DOWNLOAD = 'DOWNLOAD',
}

export interface WebsiteFormData {
  siteName: string;
  siteType: string; // e.g., Blog, E-commerce, Portfolio, Business
  primaryGoal: string; // e.g., Sell products, Share information, Generate leads
  targetAudience: string; // e.g., Young professionals, Tech enthusiasts, Local community
  keyFeatures: string; // Comma-separated or newline-separated features
  stylePreference: string; // e.g., Modern, Minimalist, Playful, Corporate
}

export interface GeneratedSiteData {
  siteName: string;
  tagline: string;
  description: string;
  keyPages: Array<{ name: string; purpose: string }>;
  colorSchemeIdea: {
    primary: string;
    secondary: string;
    accent: string;
    notes: string;
  };
  fontSuggestion: {
    heading: string;
    body: string;
  };
}

export interface IconProps {
  className?: string;
}
    