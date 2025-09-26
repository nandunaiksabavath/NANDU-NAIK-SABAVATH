import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { QueryInput } from './components/QueryInput';
import { AdvisoryResponse } from './components/AdvisoryResponse';
import { getAdvisory, getMarketPrices, MarketPrice } from './services/geminiService';
import { MarketPrices } from './components/MarketPrices';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const languages = [
  // Global Languages
  { code: 'en-US', name: 'English (US)' },

  // Indian Languages
  { code: 'hi-IN', name: 'हिन्दी (भारत)' },
  { code: 'bn-IN', name: 'বাংলা (ভারত)' },
  { code: 'te-IN', name: 'తెలుగు (భారతదేశం)' },
  { code: 'mr-IN', name: 'मराठी (भारत)' },
  { code: 'ta-IN', name: 'தமிழ் (இந்தியா)' },
  { code: 'ur-IN', name: 'اردو (بھارت)' },
  { code: 'gu-IN', name: 'ગુજરાતી (ભારત)' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (ಭಾರತ)' },
  { code: 'ml-IN', name: 'മലയാളം (ഇന്ത്യ)' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (ਭਾਰਤ)' },
  { code: 'or-IN', name: 'ଓଡିଆ (ଭାରତ)' },
  
  // Other Global Languages
  { code: 'es-ES', name: 'Español (España)' },
  { code: 'fr-FR', name: 'Français (France)' },
  { code: 'zh-CN', name: '中文 (中国大陆)' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
];

export interface Advisory {
  text: string;
  imageUrl: string | null;
}

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<Advisory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  
  // New state for Market Prices feature
  const [marketLocation, setMarketLocation] = useState<string>('');
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [isMarketLoading, setIsMarketLoading] = useState<boolean>(false);
  const [marketError, setMarketError] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError(`Speech recognition error: ${event.error}. Please ensure microphone access is granted.`);
        setIsListening(false);
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };
      recognitionRef.current = recognition;
    } else {
        console.warn("Speech Recognition API not supported in this browser.");
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLang;
    }
  }, [selectedLang]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };
  
  const handleSpeak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
        setError("Text-to-speech is not supported in this browser.");
        return;
    }
    window.speechSynthesis.cancel(); // Stop any currently playing speech before starting a new one

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setError(`Text-to-speech error: ${event.error}`);
      setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
  }, [selectedLang]);

  const handleToggleSpeaking = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (response?.text) {
      handleSpeak(response.text);
    }
  }, [isSpeaking, response, handleSpeak]);

  const handleQuerySubmit = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a question.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const selectedLanguageName = languages.find(l => l.code === selectedLang)?.name || 'English';
      const { advice, imageUrl } = await getAdvisory(query, selectedLanguageName);
      setResponse({ text: advice, imageUrl });
    } catch (err) {
      setError('Failed to get advisory. The AI expert might be busy. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedLang]);
  
  // Automatically speak the response when it is generated
  useEffect(() => {
    if (response?.text && !isLoading && !error) {
      handleSpeak(response.text);
    }
  }, [response, isLoading, error, handleSpeak]);

  const handleGetMarketPrices = useCallback(async () => {
    if (!marketLocation.trim()) {
      setMarketError('Please enter a location.');
      return;
    }

    setIsMarketLoading(true);
    setMarketError('');
    setMarketPrices([]);

    try {
      const prices = await getMarketPrices(marketLocation);
      setMarketPrices(prices);
      if (prices.length === 0) {
        setMarketError("No market data found for this location. Please try a larger nearby city or region.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setMarketError(message);
      console.error(err);
    } finally {
      setIsMarketLoading(false);
    }
  }, [marketLocation]);

  return (
    <div className="min-h-screen font-sans text-brand-gray flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
            <QueryInput
              query={query}
              setQuery={setQuery}
              onSubmit={handleQuerySubmit}
              isLoading={isLoading}
              isListening={isListening}
              onToggleListening={handleToggleListening}
              selectedLang={selectedLang}
              setSelectedLang={setSelectedLang}
              languages={languages}
            />
            <AdvisoryResponse
              response={response}
              isLoading={isLoading}
              error={error}
              isSpeaking={isSpeaking}
              onToggleSpeaking={handleToggleSpeaking}
            />
          </div>
          <MarketPrices
            location={marketLocation}
            setLocation={setMarketLocation}
            onSubmit={handleGetMarketPrices}
            prices={marketPrices}
            isLoading={isMarketLoading}
            error={marketError}
          />
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Kisan Mitra Advisory. Empowering farmers with AI.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
