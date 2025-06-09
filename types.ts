
export interface UserPreferences {
  websiteType: string;
  topic: string;
  sections: string; // Comma-separated list of sections
  colorScheme: string;
  specificRequests?: string;
}

export interface GeneratedTemplate {
  id: string;
  name: string;
  htmlContent: string;
  preferences: UserPreferences;
}

export enum AppStep {
  FORM = 'FORM',
  PREVIEW = 'PREVIEW',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  DOWNLOAD = 'DOWNLOAD',
}
