import React from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { StopIcon } from './icons/StopIcon';
import { Advisory } from '../App';

interface AdvisoryResponseProps {
  response: Advisory | null;
  isLoading: boolean;
  error: string;
  isSpeaking: boolean;
  onToggleSpeaking: () => void;
}

export const AdvisoryResponse: React.FC<AdvisoryResponseProps> = ({ response, isLoading, error, isSpeaking, onToggleSpeaking }) => {
  const hasResponse = response && response.text;
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Kisan Mitra's Recommendation
        </h2>
        {hasResponse && !isLoading && !error && (
          <button
            onClick={onToggleSpeaking}
            className="flex items-center gap-2 text-sm font-medium text-brand-green hover:text-brand-green-dark transition-colors"
            aria-label={isSpeaking ? "Stop reading aloud" : "Read recommendation aloud"}
          >
            {isSpeaking ? (
              <>
                <StopIcon className="w-5 h-5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <SpeakerIcon className="w-5 h-5" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="p-6 bg-gray-50 rounded-lg min-h-[200px] prose prose-green max-w-none flex flex-col justify-center">
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center text-gray-500">
            <LoadingSpinner className="w-8 h-8 mb-4" />
            <p className="font-semibold">Consulting agricultural experts...</p>
            <p>Generating your personalized advice and visuals.</p>
          </div>
        )}
        {error && <p className="text-red-600 font-semibold text-center">{error}</p>}
        {!isLoading && !error && !hasResponse && (
          <p className="text-gray-500 text-center">
            Your expert advice will appear here. Ask a question above to get started.
          </p>
        )}
        {hasResponse && (
           <div className="w-full">
            {response.imageUrl && (
              <img 
                src={response.imageUrl} 
                alt="Visually relevant advice from Kisan Mitra" 
                className="w-full h-auto max-h-80 object-cover rounded-lg mb-4 border" 
              />
            )}
            <div className="whitespace-pre-wrap font-serif text-gray-700">{response.text}</div>
          </div>
        )}
      </div>
    </div>
  );
};