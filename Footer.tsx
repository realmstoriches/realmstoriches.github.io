
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-center p-4 text-sm text-gray-400 border-t border-slate-700">
      <p>&copy; {new Date().getFullYear()} AI Website Concepts. All rights reserved.</p>
      <p>Powered by Gemini API & React</p>
    </footer>
  );
};

export default Footer;
    