import React, { useState, useEffect } from 'react';
import { X, Sliders, CheckCircle2 } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { CustomTransactionType } from '../../types';

interface CustomTransactionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingType?: CustomTransactionType | null;
}

export const CustomTransactionTypeModal: React.FC<CustomTransactionTypeModalProps> = ({
  isOpen,
  onClose,
  editingType = null,
}) => {
  const { addCustomTransactionType, updateCustomTransactionType } = useLedger();

  const [name, setName] = useState('');
  const [urduLabel, setUrduLabel] = useState('');
  const [cashFlow, setCashFlow] = useState<'inflow' | 'outflow' | 'transfer' | 'none'>('inflow');
  const [plEffect, setPlEffect] = useState<'income' | 'expense' | 'neutral'>('income');
  const [scope, setScope] = useState<'business' | 'personal' | 'transfer' | 'party'>('business');
  const [color, setColor] = useState('#10B981');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingType) {
      setName(editingType.name);
      setUrduLabel(editingType.urduLabel || '');
      setCashFlow(editingType.cashFlow);
      setPlEffect(editingType.plEffect);
      setScope(editingType.scope);
      setColor(editingType.color || '#3B82F6');
      setDescription(editingType.description || '');
    } else {
      setName('');
      setUrduLabel('');
      setCashFlow('inflow');
      setPlEffect('income');
      setScope('business');
      setColor('#10B981');
      setDescription('');
    }
  }, [isOpen, editingType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a type name');
      return;
    }

    if (editingType) {
      updateCustomTransactionType(editingType.id, {
        name: name.trim(),
        urduLabel: urduLabel.trim() || undefined,
        cashFlow,
        plEffect,
        scope,
        color,
        description: description.trim() || undefined,
      });
    } else {
      addCustomTransactionType({
        name: name.trim(),
        urduLabel: urduLabel.trim() || undefined,
        cashFlow,
        plEffect,
        scope,
        color,
        description: description.trim() || undefined,
        isEnabled: true,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {editingType ? 'Edit Transaction Type & Rules' : 'Create Custom Transaction Type'}
              </h3>
              <p className="text-xs text-slate-400">
                Define accounting rules: cash flow effect, profit & loss, and operational scope
              </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Type Title (English) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Service Income / Loan Received / Owner Investment"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Urdu Label (Optional)
              </label>
              <input
                type="text"
                value={urduLabel}
                onChange={(e) => setUrduLabel(e.target.value)}
                placeholder="e.g. سروس آمدنی / قرض وصولی"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Cash Flow Accounting Rule */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-white">
              Cash Flow Effect on Account Balance:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCashFlow('inflow')}
                className={`p-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                  cashFlow === 'inflow'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Inflow (+)
                <span className="block text-[10px] font-normal opacity-80">Increases cash</span>
              </button>
              <button
                type="button"
                onClick={() => setCashFlow('outflow')}
                className={`p-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                  cashFlow === 'outflow'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Outflow (-)
                <span className="block text-[10px] font-normal opacity-80">Deducts cash</span>
              </button>
              <button
                type="button"
                onClick={() => setCashFlow('none')}
                className={`p-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                  cashFlow === 'none'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                None (Memo)
                <span className="block text-[10px] font-normal opacity-80">e.g. credit/udhaar</span>
              </button>
            </div>
          </div>

          {/* Profit & Loss Accounting Rule */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-white">
              Profit & Loss Operating Impact:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlEffect('income')}
                className={`p-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                  plEffect === 'income'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Operating Revenue
                <span className="block text-[10px] font-normal opacity-80">Adds to Net Profit</span>
              </button>
              <button
                type="button"
                onClick={() => setPlEffect('expense')}
                className={`p-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                  plEffect === 'expense'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Operating Expense
                <span className="block text-[10px] font-normal opacity-80">Deducts from Profit</span>
              </button>
              <button
                type="button"
                onClick={() => setPlEffect('neutral')}
                className={`p-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                  plEffect === 'neutral'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Neutral (Balance Sheet)
                <span className="block text-[10px] font-normal opacity-80">Loan / Capital / Drawings</span>
              </button>
            </div>
          </div>

          {/* Operational Scope */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Financial Scope
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('business')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg cursor-pointer ${
                  scope === 'business' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Shop Business
              </button>
              <button
                type="button"
                onClick={() => setScope('personal')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg cursor-pointer ${
                  scope === 'personal' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Personal / Zaati
              </button>
              <button
                type="button"
                onClick={() => setScope('party')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg cursor-pointer ${
                  scope === 'party' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Customer / Supplier
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Capital injected by owner, does not affect operating net profit"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md cursor-pointer"
            >
              {editingType ? 'Update Transaction Type' : 'Create Transaction Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
