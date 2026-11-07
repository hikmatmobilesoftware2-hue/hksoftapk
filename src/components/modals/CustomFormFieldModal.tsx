import React, { useState, useEffect } from 'react';
import { X, FormInput, Plus, Trash2 } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { CustomFormField } from '../../types';

interface CustomFormFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingField?: CustomFormField | null;
}

export const CustomFormFieldModal: React.FC<CustomFormFieldModalProps> = ({
  isOpen,
  onClose,
  editingField = null,
}) => {
  const { addCustomFormField, updateCustomFormField } = useLedger();

  const [label, setLabel] = useState('');
  const [type, setType] = useState<'text' | 'number' | 'select' | 'textarea' | 'date'>('text');
  const [applicableTo, setApplicableTo] = useState<'all' | 'income' | 'expense'>('all');
  const [required, setRequired] = useState(false);
  const [showInReceipt, setShowInReceipt] = useState(true);
  const [placeholder, setPlaceholder] = useState('');
  const [optionsStr, setOptionsStr] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingField) {
      setLabel(editingField.label);
      setType(editingField.type);
      setApplicableTo(editingField.applicableTo);
      setRequired(editingField.required);
      setShowInReceipt(editingField.showInReceipt ?? true);
      setPlaceholder(editingField.placeholder || '');
      setOptionsStr(editingField.options ? editingField.options.join(', ') : '');
    } else {
      setLabel('');
      setType('text');
      setApplicableTo('all');
      setRequired(false);
      setShowInReceipt(true);
      setPlaceholder('');
      setOptionsStr('');
    }
  }, [isOpen, editingField]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      alert('Please enter field label');
      return;
    }

    const options =
      type === 'select'
        ? optionsStr
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    if (editingField) {
      updateCustomFormField(editingField.id, {
        label: label.trim(),
        type,
        applicableTo,
        required,
        showInReceipt,
        placeholder: placeholder.trim() || undefined,
        options,
      });
    } else {
      addCustomFormField({
        label: label.trim(),
        type,
        applicableTo,
        required,
        isEnabled: true,
        showInReceipt,
        placeholder: placeholder.trim() || undefined,
        options,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FormInput className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {editingField ? 'Edit Custom Field' : 'Add Custom Form Field'}
              </h3>
              <p className="text-[11px] text-slate-400">Add dynamic input fields to income/expense vouchers</p>
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
              Field Label / Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. IMEI Number, Warranty Period, Technician Name, Discount %"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Input Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="text">Single Line Text</option>
                <option value="number">Numeric Value</option>
                <option value="select">Dropdown Select</option>
                <option value="textarea">Multi-line Notes</option>
                <option value="date">Date Picker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Applicable Forms
              </label>
              <select
                value={applicableTo}
                onChange={(e) => setApplicableTo(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="all">All Forms (Income & Expense)</option>
                <option value="income">Income Forms Only</option>
                <option value="expense">Expense Forms Only</option>
              </select>
            </div>
          </div>

          {type === 'select' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dropdown Options (Comma separated)
              </label>
              <input
                type="text"
                required
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Placeholder Hint (Optional)
            </label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="e.g. Enter 15-digit IMEI..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <span className="text-xs text-slate-300">Mandatory (Required Field)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInReceipt}
                onChange={(e) => setShowInReceipt(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <span className="text-xs text-slate-300">Print on Thermal Receipt & Voucher Slip</span>
            </label>
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
              {editingField ? 'Save Changes' : 'Add Form Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
