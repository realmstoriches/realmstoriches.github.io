import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Your main component

// --- OLD CODE ---
// This is what's causing the error. It looks for an element with id="root".
// const rootElement = document.getElementById('root');
// ReactDOM.createRoot(rootElement).render(<App />);

// --- NEW, CORRECTED CODE ---
const aiGeneratorContainer = document.getElementById('ai-concept-app-container');

if (aiGeneratorContainer) {
  const root = ReactDOM.createRoot(aiGeneratorContainer);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
    // This is good practice for debugging. It won't throw an error,
    // but it will let you know in the console if the script runs on a
    // page without the container, like your checkout page.
    console.warn("AI Concept Generator container not found. React app not mounted.");
}
