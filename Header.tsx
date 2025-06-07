
import React from 'react';
import { SparklesIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-md shadow-lg p-4 sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-center md:justify-start">
        <SparklesIcon className="w-10 h-10 text-primary mr-3" />
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-pink-500">
          AI Website Concept Generator
        </h1>
      </div>
    </header>
  );
};

export default Header;
    