import React from 'react';
import { MarketPrice } from '../services/geminiService';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface MarketPricesProps {
  location: string;
  setLocation: (location: string) => void;
  onSubmit: () => void;
  prices: MarketPrice[];
  isLoading: boolean;
  error: string;
}

export const MarketPrices: React.FC<MarketPricesProps> = ({
  location,
  setLocation,
  onSubmit,
  prices,
  isLoading,
  error,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 border-b pb-2 mb-4">
        <ChartBarIcon className="w-6 h-6 text-brand-green" />
        <h2 className="text-xl font-semibold text-gray-800">
          Local Commodity Prices
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <label htmlFor="location-input" className="block text-lg font-semibold text-gray-700 mb-2">
          Enter your location
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            id="location-input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-green focus:border-brand-green transition duration-150 ease-in-out"
            placeholder="e.g., 'Nashik, Maharashtra'"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !location.trim()}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="w-5 h-5" />
                Fetching...
              </>
            ) : (
              'Get Prices'
            )}
          </button>
        </div>
      </form>
      
      <div className="min-h-[150px] flex flex-col justify-center">
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center text-gray-500">
            <LoadingSpinner className="w-8 h-8 mb-4" />
            <p className="font-semibold">Fetching latest market data...</p>
          </div>
        )}
        {error && <p className="text-red-600 font-semibold text-center">{error}</p>}
        {!isLoading && !error && prices.length === 0 && (
          <p className="text-gray-500 text-center">
            Enter a location to see local commodity prices.
          </p>
        )}
        {!isLoading && prices.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Min Price (₹/Quintal)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Max Price (₹/Quintal)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prices.map((price, index) => (
                  <tr key={index} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{price.commodity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{price.variety}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{price.market}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{price.minPrice.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{price.maxPrice.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
