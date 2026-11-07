import React, { useState } from 'react';
import { X, ArrowRightLeft, ArrowDown } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { toDatetimeLocal } from '../../utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, transferFunds, settings } = useLedger();

  const activeAccounts = accounts.filter((a) => !a.isArchived && a.isEnabled !== false);
  const [fromAccountId, setFromAccountId] = useState(activeAccounts[0]?.id || accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(activeAccounts[1]?.id || activeAccounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toDatetimeLocal());
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid transfer amount');
      return;
    }

    if (fromAccountId === toAccountId) {
      alert('Source and destination accounts must be different');
      return;
    }

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    if (fromAcc && fromAcc.currentBalance < numAmount) {
      if (
        !confirm(
          `Warning: Source account balance (${settings.currency.symbol} ${fromAcc.currentBalance.toLocaleString()}) is lower than transfer amount (${settings.currency.symbol} ${numAmount.toLocaleString()}). Proceed anyway?`
        )
      ) {
        return;
      }
    }

    transferFunds({
      fromAccountId,
      toAccountId,
      amount: numAmount,
      date,
      description: description.trim(),
    });

    onClose();
  };

  const fromAcc = accounts.find((a) => a.id === fromAccountId);
  const toAcc = accounts.find((a) => a.id === toAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Account Transfer (Raqam Muntaqil Karein)
              </h3>
              <p className="text-[11px] text-slate-400">Cash & Bank Internal Transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              From Account (Source)
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            >
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — Current: {settings.currency.symbol} {acc.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center -my-1 text-slate-500">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              To Account (Destination)
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            >
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                  {acc.name} — Current: {settings.currency.symbol} {acc.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Transfer Amount ({settings.currency.symbol}) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {settings.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-bold font-mono text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason / Transfer Note (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Shop cash deposited to Meezan Bank / ATM withdrawal"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
