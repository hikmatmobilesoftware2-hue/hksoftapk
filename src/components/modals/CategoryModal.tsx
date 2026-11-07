import React, { useState, useEffect } from 'react';
import { X, Tag, Sparkles } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { Category } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: Category | null;
  defaultType?: 'income' | 'expense';
}

const AVAILABLE_ICONS = [
  { name: 'Smartphone', label: 'Mobile' },
  { name: 'Wrench', label: 'Repairs' },
  { name: 'Package', label: 'Accessories' },
  { name: 'Cpu', label: 'Software' },
  { name: 'Receipt', label: 'Billing' },
  { name: 'RefreshCw', label: 'Trade-in' },
  { name: 'Building', label: 'Rent/Shop' },
  { name: 'Zap', label: 'Electric' },
  { name: 'Wifi', label: 'Internet' },
  { name: 'Coffee', label: 'Food/Tea' },
  { name: 'Truck', label: 'Transport' },
  { name: 'Layers', label: 'Parts/LCD' },
  { name: 'Key', label: 'Dongle/Tools' },
  { name: 'Users', label: 'Staff/Salary' },
  { name: 'User', label: 'Personal' },
  { name: 'Home', label: 'Household' },
  { name: 'ShoppingBag', label: 'Shopping' },
  { name: 'PlusCircle', label: 'Other Inc' },
  { name: 'MinusCircle', label: 'Other Exp' },
];

const AVAILABLE_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#64748B', // Slate
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory = null,
  defaultType = 'income',
}) => {
  const { addCategory, updateCategory } = useLedger();

  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [isBusiness, setIsBusiness] = useState(true);
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('Smartphone');

  useEffect(() => {
    if (!isOpen) return;
    if (editingCategory) {
      setName(editingCategory.name);
      setUrduName(editingCategory.urduName || '');
      setType(editingCategory.type);
      setIsBusiness(editingCategory.isBusiness);
      setColor(editingCategory.color || '#3B82F6');
      setIcon(editingCategory.icon || 'Smartphone');
    } else {
      setName('');
      setUrduName('');
      setType(defaultType);
      setIsBusiness(true);
      setColor(defaultType === 'income' ? '#10B981' : '#EF4444');
      setIcon(defaultType === 'income' ? 'Smartphone' : 'Building');
    }
  }, [isOpen, editingCategory, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        urduName: urduName.trim() || undefined,
        type,
        isBusiness,
        color,
        icon,
      });
    } else {
      addCategory({
        name: name.trim(),
        urduName: urduName.trim() || undefined,
        type,
        isBusiness,
        color,
        icon,
        isEnabled: true,
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
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {editingCategory ? 'Edit Category' : 'Create Custom Category'}
              </h3>
              <p className="text-[11px] text-slate-400">Configure financial classification</p>
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
          {/* Income vs Expense Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                + Income (Aamdani)
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                - Expense (Kharch)
              </button>
            </div>
          </div>

          {/* Name & Urdu Label */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Unlocking, Flashing, Shop Rent, Courier..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Urdu Name / Label (Optional)
            </label>
            <input
              type="text"
              value={urduName}
              onChange={(e) => setUrduName(e.target.value)}
              placeholder="e.g. موبائل مرمت، ان لاکنگ، کرایہ"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
          </div>

          {/* Business vs Personal */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Classification</span>
              <span className="text-[10px] text-slate-400">
                {isBusiness ? 'Shop Business (Counted in Profit)' : 'Personal / Zaati (Excluded from Shop Profit)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsBusiness(true)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer ${
                  isBusiness ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Shop
              </button>
              <button
                type="button"
                onClick={() => setIsBusiness(false)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer ${
                  !isBusiness ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Personal
              </button>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-lg transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`p-2 rounded-lg text-center text-[10px] transition-colors cursor-pointer ${
                    icon === item.name
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
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
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
