// components/ui/InfoTooltip.tsx
import React, { useState } from 'react';
import { TERMINOLOGY } from '../../data/terminology';

interface InfoTooltipProps {
  term: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ term }) => {
  const [isVisible, setIsVisible] = useState(false);
  const definition = TERMINOLOGY[term];

  if (!definition) {
    const termKey = term.split(' ')[0] as keyof typeof TERMINOLOGY;
    if(!TERMINOLOGY[termKey]) return null;
  }

  const finalDefinition = definition || TERMINOLOGY[term.split(' ')[0] as keyof typeof TERMINOLOGY];

  return (
    <div className="relative inline-flex items-center ml-1">
      <button 
        onMouseEnter={() => setIsVisible(true)} 
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {e.preventDefault(); e.stopPropagation(); setIsVisible(v => !v)}}
        className="cursor-pointer text-slate-500 hover:text-primary-color"
        aria-label={`Información sobre ${term}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-lg shadow-xl z-20 animate-fade-in text-sm text-slate-300">
          <p><strong>{term}:</strong> {finalDefinition}</p>
        </div>
      )}
    </div>
  );
};
