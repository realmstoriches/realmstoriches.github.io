import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { WebsiteFormData, GeneratedSiteData } from '../types';
import { API_KEY as API_KEY_FROM_FILE } from '../apiKey.js';

// Define placeholder keys to check against.
// The second placeholder is from your provided apiKey.js example.
const PLACEHOLDER_KEYS = ["YOUR_API_KEY_HERE", "AIzaSyB4Ryd2tJpQAWNbaj58NbWDwkxdZThYAeg"];
let effectiveApiKey: string | undefined = process.env.API_KEY; // Default to environment variable (for CI/deployment)

// If API_KEY_FROM_FILE is present and not a placeholder, it takes precedence (for local development)
if (API_KEY_FROM_FILE && !PLACEHOLDER_KEYS.includes(API_KEY_FROM_FILE)) {
  effectiveApiKey = API_KEY_FROM_FILE;
  console.info("Using API key from apiKey.js for local development.");
} else if (API_KEY_FROM_FILE && PLACEHOLDER_KEYS.includes(API_KEY_FROM_FILE)) {
  console.info("Placeholder API key found in apiKey.js. Relying on environment variable for API_KEY.");
} else if (effectiveApiKey) {
  console.info("Using API key from environment variable.");
}


if (!effectiveApiKey || PLACEHOLDER_KEYS.includes(effectiveApiKey)) {
  const errorMessage = "API_KEY is not configured or is a placeholder. Please update apiKey.js (if developing locally and it's gitignored) or configure the API_KEY environment variable (e.g., via GitHub Secrets for deployment).";
  console.error(errorMessage);
  // This error will be thrown during initialization, preventing the app from making unauthenticated API calls.
  throw new Error(errorMessage);
}

const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
const model = ai.models;

export const generateWebsiteConcept = async (formData: WebsiteFormData): Promise<GeneratedSiteData> => {
  const prompt = `
    You are an expert web design consultant and branding specialist.
    A user wants to create a new website and has provided the following details:
    - Website Name: ${formData.siteName}
    - Website Type: ${formData.siteType}
    - Primary Goal: ${formData.primaryGoal}
    - Target Audience: ${formData.targetAudience}
    - Key Features Desired (user input, interpret creatively): ${formData.keyFeatures}
    - Preferred Style/Vibe: ${formData.stylePreference}

    Based on this information, generate a comprehensive website concept.
    Your response MUST be a valid JSON object matching the following TypeScript interface:

    \`\`\`typescript
    interface GeneratedSiteData {
      siteName: string; // The user's site name, or a slightly enhanced version if appropriate.
      tagline: string; // A catchy and relevant tagline (5-10 words).
      description: string; // A concise and compelling description of the website (2-3 sentences, around 50-70 words).
      keyPages: Array<{ name: string; purpose: string }>; // Suggest 3-5 essential pages with a brief purpose for each. Examples: "Home", "About Us", "Services", "Blog", "Contact", "Gallery", "Shop".
      colorSchemeIdea: {
        primary: string; // Hex code for primary color
        secondary: string; // Hex code for secondary color
        accent: string; // Hex code for accent color
        notes: string; // Brief description of the color scheme's feel (e.g., "Warm and inviting with earthy tones", "Modern and sleek with a vibrant accent")
      };
      fontSuggestion: {
        heading: string; // Name of a Google Font suitable for headings
        body: string;    // Name of a Google Font suitable for body text (should pair well with heading font)
      };
    }
    \`\`\`

    Key considerations for your response:
    - Tagline: Make it memorable and reflective of the site's essence.
    - Description: Clearly articulate the website's value proposition.
    - Key Pages: Select pages that are most crucial for the website type and goals. For each page, provide a concise purpose.
    - Color Scheme: Suggest specific hex codes for primary, secondary, and accent colors that align with the preferred style. Provide a brief note explaining the vibe.
    - Font Suggestion: Recommend a pair of Google Fonts (one for headings, one for body) that match the style preference.
    - Be creative and professional. The output should be directly usable by a web designer or developer as a starting point.
    - Ensure the siteName in the response is exactly what the user provided: "${formData.siteName}".
    - Ensure the JSON is well-formed and complete.
`;

  try {
    const response: GenerateContentResponse = await model.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as GeneratedSiteData;

    if (!parsedData.siteName || !parsedData.tagline || !parsedData.keyPages || !parsedData.colorSchemeIdea || !parsedData.fontSuggestion) {
        console.error("AI response is missing some required fields:", parsedData);
        throw new Error("AI response is missing some required fields. The format might be incorrect.");
    }
    
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    if (error instanceof Error && (error.message.includes("API_KEY_INVALID") || error.message.includes("API key not valid") || error.message.includes("PERMISSION_DENIED") || error.message.includes("API Key not found"))) {
         throw new Error("The API key is invalid or missing required permissions. Please check your apiKey.js (local) or environment configuration (deployment).");
    }
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse AI response as JSON. The AI might have returned an unexpected format.");
    }
    throw new Error(`Failed to generate website concept. ${error instanceof Error ? error.message : String(error)}`);
  }
};
