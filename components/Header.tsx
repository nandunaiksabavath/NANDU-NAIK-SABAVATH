import React from 'react';
import { LeafIcon } from './icons/LeafIcon';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex justify-center items-center gap-3">
        <LeafIcon className="w-10 h-10 text-brand-green" />
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-green-dark">
          Kisan Mitra
        </h1>
      </div>
      <p className="mt-2 text-lg text-brand-gray">
        Your AI-Powered Farming Advisor
      </p>
    </header>
  );
};