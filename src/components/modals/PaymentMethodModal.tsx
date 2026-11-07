import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { PaymentMethod } from '../../types';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMethod?: PaymentMethod | null;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  editingMethod = null,
}) => {
  const { addPaymentMethod, updatePaymentMethod } = useLedger();

  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingMethod) {
      setName(editingMethod.name);
      setUrduName(editingMethod.urduName || '');
      setColor(editingMethod.color || '#3B82F6');
      setIsDefault(editingMethod.isDefault || false);
    } else {
      setName('');
      setUrduName('');
      setColor('#10B981');
      setIsDefault(false);
    }
  }, [isOpen, editingMethod]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter payment method name');
      return;
    }

    if (editingMethod) {
      updatePaymentMethod(editingMethod.id, {
        name: name.trim(),
        urduName: urduName.trim() || undefined,
        color,
        isDefault,
      });
    } else {
      addPaymentMethod({
        name: name.trim(),
        urduName: urduName.trim() || undefined,
        color,
        isEnabled: true,
        orderIndex: 99,
        isDefault,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {editingMethod ? 'Edit Payment Method' : 'Add Custom Payment Method'}
              </h3>
              <p className="text-[11px] text-slate-400">Cash, Digital Wallet, Bank Transfer, QR, etc.</p>
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
              Payment Method Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raast QR, Meezan Bank, Cash Counter, SadaPay..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Urdu / Regional Name (Optional)
            </label>
            <input
              type="text"
              value={urduName}
              onChange={(e) => setUrduName(e.target.value)}
              placeholder="e.g. نقد، بینک، ایزی پیسہ"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-white block">Default Selected Method</span>
              <span className="text-[10px] text-slate-400">Auto-selected on new transaction entry</span>
            </div>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
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
              {editingMethod ? 'Save Changes' : 'Create Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
