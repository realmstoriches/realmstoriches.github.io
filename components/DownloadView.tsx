
import React from 'react';
import { GeneratedSiteData } from '../types';
import Button from './Button';
import Card from './Card';
import { DownloadIcon, SparklesIcon, CheckCircleIcon, ArrowPathIcon } from './Icons';

interface DownloadViewProps {
  siteData: GeneratedSiteData;
  onStartOver: () => void;
}

const DownloadView: React.FC<DownloadViewProps> = ({ siteData, onStartOver }) => {
  const downloadJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(siteData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `${siteData.siteName.toLowerCase().replace(/\s+/g, '-')}-concept.json`;
    link.click();
  };

  const downloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Concept: ${siteData.siteName}</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; color: #333; }
        .container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: ${siteData.colorSchemeIdea.primary || '#333'}; }
        h1 { border-bottom: 2px solid ${siteData.colorSchemeIdea.primary || '#eee'}; padding-bottom: 10px; }
        .tagline { font-style: italic; color: #555; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 1.5em; margin-bottom: 10px; }
        ul { list-style: disc; padding-left: 20px; }
        li { margin-bottom: 5px; }
        .color-palette div { display: inline-block; width: 50px; height: 50px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; text-align: center; line-height: 50px; font-size: 0.8em; }
        .font-pair p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Website Concept: ${siteData.siteName}</h1>
        <p class="tagline">${siteData.tagline}</p>
        
        <div class="section">
            <h2>Description</h2>
            <p>${siteData.description.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div class="section">
            <h2>Key Pages</h2>
            <ul>
                ${siteData.keyPages.map(page => `<li><strong>${page.name}:</strong> ${page.purpose}</li>`).join('')}
            </ul>
        </div>
        
        <div class="section">
            <h2>Color Scheme Idea</h2>
            <p>${siteData.colorSchemeIdea.notes}</p>
            <div class="color-palette">
                <div style="background-color: ${siteData.colorSchemeIdea.primary}; color: #fff;">Primary</div>
                <div style="background-color: ${siteData.colorSchemeIdea.secondary};">Secondary</div>
                <div style="background-color: ${siteData.colorSchemeIdea.accent};">Accent</div>
            </div>
        </div>

        <div class="section">
            <h2>Font Suggestion</h2>
            <div class="font-pair">
                <p><strong>Headings:</strong> ${siteData.fontSuggestion.heading}</p>
                <p><strong>Body Text:</strong> ${siteData.fontSuggestion.body}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${siteData.siteName.toLowerCase().replace(/\s+/g, '-')}-concept.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };


  return (
    <Card className="max-w-2xl mx-auto text-gray-200">
      <div className="text-center mb-6">
        <CheckCircleIcon className="w-16 h-16 text-accent mx-auto mb-3" />
        <h2 className="text-3xl font-bold text-gray-100">Success! Your Concept is Ready!</h2>
        <p className="text-gray-400 mt-1">
          The AI has generated a concept for <span className="font-semibold text-primary">{siteData.siteName}</span>.
        </p>
      </div>

      <div className="bg-slate-700 p-6 rounded-lg shadow-inner mb-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-primary flex items-center"><SparklesIcon className="w-5 h-5 mr-2"/>Tagline:</h3>
          <p className="italic text-gray-300">"{siteData.tagline}"</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-primary">Description:</h3>
          <p className="text-gray-300 whitespace-pre-line">{siteData.description}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-primary">Key Pages:</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1 pl-2">
            {siteData.keyPages.map((page, index) => (
              <li key={index}><strong>{page.name}:</strong> {page.purpose}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-primary">Color Scheme Idea:</h3>
          <p className="text-gray-300">{siteData.colorSchemeIdea.notes}</p>
          <div className="flex space-x-2 mt-2">
            <span className="p-2 rounded text-xs text-white" style={{backgroundColor: siteData.colorSchemeIdea.primary}}>Primary</span>
            <span className="p-2 rounded text-xs" style={{backgroundColor: siteData.colorSchemeIdea.secondary, color: '#333'}}>Secondary</span>
            <span className="p-2 rounded text-xs text-white" style={{backgroundColor: siteData.colorSchemeIdea.accent}}>Accent</span>
          </div>
        </div>
         <div>
          <h3 className="text-xl font-semibold text-primary">Font Suggestion:</h3>
          <p className="text-gray-300">Headings: <span className="font-semibold">{siteData.fontSuggestion.heading}</span></p>
          <p className="text-gray-300">Body: <span className="font-semibold">{siteData.fontSuggestion.body}</span></p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button onClick={downloadJson} icon={<DownloadIcon className="w-5 h-5"/>} fullWidth variant="primary">
          Download as JSON
        </Button>
        <Button onClick={downloadHtml} icon={<DownloadIcon className="w-5 h-5"/>} fullWidth variant="secondary">
          Download as HTML
        </Button>
      </div>
       <Button onClick={onStartOver} icon={<ArrowPathIcon className="w-5 h-5"/>} fullWidth variant="outline" className="mt-4">
          Create Another Concept
        </Button>
    </Card>
  );
};

export default DownloadView;
    