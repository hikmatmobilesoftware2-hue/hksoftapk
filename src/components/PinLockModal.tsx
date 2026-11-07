import React, { useState } from 'react';
import { Lock, ShieldCheck, Delete, ArrowRight } from 'lucide-react';
import { useLedger } from '../context/LedgerContext';

export const PinLockModal: React.FC = () => {
  const { unlockApp, settings } = useLedger();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      
      // Auto-submit when length matches
      if (nextPin.length === (settings.pinCode?.length || 4)) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = (codeToVerify: string) => {
    const success = unlockApp(codeToVerify);
    if (!success) {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">HIKMAT LEDGER PRO</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">Security Protected · Enter Security PIN</p>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-red-500 scale-110'
                    : isFilled
                    ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-4 font-medium animate-shake">
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-700 text-lg font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-400 transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-700 text-lg font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>HIKMAT MOBILE SOFTWARE · Offline Encrypted</span>
        </div>
      </div>
    </div>
  );
};
