import React from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  languages: { code: string; name: string }[];
}

export const QueryInput: React.FC<QueryInputProps> = ({ 
  query, 
  setQuery, 
  onSubmit, 
  isLoading, 
  isListening, 
  onToggleListening, 
  selectedLang, 
  setSelectedLang,
  languages
}) => {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="farm-query" className="block text-lg font-semibold text-gray-700 mb-2">
        What's on your mind, farmer?
      </label>
      <div className="relative">
        <textarea
          id="farm-query"
          rows={4}
          className="w-full p-4 pr-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-green focus:border-brand-green transition duration-150 ease-in-out"
          placeholder="e.g., 'What are the best practices for pest control in organic tomato farming?' or use the mic to ask."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={onToggleListening}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          <MicrophoneIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto flex-grow flex justify-center items-center gap-2 bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-5 h-5" />
              Getting Advice...
            </>
          ) : (
            'Get Expert Advice'
          )}
        </button>
        <div className="w-full sm:w-auto">
          <label htmlFor="language-select" className="sr-only">Select Language</label>
          <select
            id="language-select"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full h-full bg-white border border-gray-300 rounded-lg py-3 px-4 shadow-sm focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors duration-200"
            disabled={isLoading || isListening}
            aria-label="Select language for voice input and AI response"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
};