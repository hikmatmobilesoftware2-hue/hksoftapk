import React, { useState, useEffect, useMemo } from 'react';
import { X, Upload, Plus, Tag, Check, Sliders } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { Transaction, TransactionType } from '../../types';
import { toDatetimeLocal } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  defaultPartyId?: string;
  defaultPartyType?: 'customer' | 'supplier';
  defaultPartyName?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'income',
  editingTransaction = null,
  defaultPartyId,
  defaultPartyType,
  defaultPartyName,
}) => {
  const {
    accounts,
    categories,
    customers,
    suppliers,
    customTransactionTypes,
    paymentMethods,
    customFormFields,
    settings,
    addTransaction,
    updateTransaction,
    addCategory,
  } = useLedger();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(toDatetimeLocal());
  const [category, setCategory] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [isBusiness, setIsBusiness] = useState<boolean>(true);
  const [partyType, setPartyType] = useState<'customer' | 'supplier' | 'none'>('none');
  const [partyId, setPartyId] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Inline category addition
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Quick addition preset amounts
  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000, 25000];

  const activeTypes = useMemo(() => customTransactionTypes.filter((t) => t.isEnabled), [customTransactionTypes]);
  const activeAccounts = useMemo(() => accounts.filter((a) => !a.isArchived && a.isEnabled !== false), [accounts]);
  const activePaymentMethods = useMemo(() => paymentMethods.filter((pm) => pm.isEnabled), [paymentMethods]);
  const activeCategories = useMemo(() => categories.filter((c) => !c.isArchived && c.isEnabled !== false), [categories]);
  const activeCustomers = useMemo(() => customers.filter((c) => !c.isArchived), [customers]);
  const activeSuppliers = useMemo(() => suppliers.filter((s) => !s.isArchived), [suppliers]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
      setAccountId(editingTransaction.accountId);
      setPaymentMethod(
        editingTransaction.paymentMethod ||
          paymentMethods.find((pm) => pm.isEnabled)?.name ||
          'Cash (Naqd)'
      );
      setReferenceNo(editingTransaction.referenceNo || '');
      setIsBusiness(editingTransaction.isBusiness);
      setPartyType(editingTransaction.partyType || (editingTransaction.partyName ? 'customer' : 'none'));
      setPartyId(editingTransaction.partyId || '');
      setPartyName(editingTransaction.partyName || '');
      setDescription(editingTransaction.description || '');
      setNotes(editingTransaction.notes || '');
      setReceiptImage(editingTransaction.receiptImage);
      setCustomFieldValues(editingTransaction.customFieldValues || {});
    } else {
      setType(initialType);
      setAmount('');
      setDate(toDatetimeLocal());
      const firstActiveAccount = accounts.find((a) => !a.isArchived && a.isEnabled !== false);
      setAccountId(firstActiveAccount?.id || 'acc_shop_cash');
      const defaultPm = paymentMethods.find((p) => p.isEnabled && p.isDefault) || paymentMethods.find((p) => p.isEnabled);
      setPaymentMethod(defaultPm?.name || 'Cash (Naqd)');
      setReferenceNo('');

      const isExp =
        initialType === 'expense' ||
        initialType === 'supplier_payment' ||
        initialType === 'supplier_credit';
      const available = categories.filter(
        (c) => !c.isArchived && c.isEnabled !== false && (isExp ? c.type === 'expense' : c.type === 'income')
      );
      const firstCat = available[0] || categories.find((c) => !c.isArchived && c.isEnabled !== false);
      if (firstCat) {
        setCategory(firstCat.name);
        setIsBusiness(firstCat.isBusiness);
      } else {
        setCategory('');
        setIsBusiness(true);
      }

      if (defaultPartyId && defaultPartyType) {
        setPartyType(defaultPartyType);
        setPartyId(defaultPartyId);
        setPartyName(defaultPartyName || '');
      } else {
        setPartyType('none');
        setPartyId('');
        setPartyName('');
      }

      setDescription('');
      setNotes('');
      setReceiptImage(undefined);
      setCustomFieldValues({});
    }
  }, [
    isOpen,
    editingTransaction,
    initialType,
    defaultPartyId,
    defaultPartyType,
    defaultPartyName,
  ]);

  const handleTypeSelect = (selectedType: TransactionType) => {
    setType(selectedType);
    const targetTypeConfig = customTransactionTypes.find((t) => t.id === selectedType);
    if (targetTypeConfig?.scope === 'party') {
      setPartyType('customer');
    }
    if (targetTypeConfig?.scope === 'personal') {
      setIsBusiness(false);
    }

    const isExp =
      selectedType === 'expense' ||
      selectedType === 'supplier_payment' ||
      selectedType === 'supplier_credit' ||
      targetTypeConfig?.plEffect === 'expense';
    const available = activeCategories.filter((c) => (isExp ? c.type === 'expense' : c.type === 'income'));
    if (available.length > 0 && (!category || !available.some((c) => c.name === category))) {
      setCategory(available[0].name);
      setIsBusiness(available[0].isBusiness);
    }
  };

  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const found = activeCategories.find((c) => c.name === catName);
    if (found) {
      setIsBusiness(found.isBusiness);
    }
  };

  const handleQuickAddAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const isExp = type === 'expense' || type === 'supplier_payment';
    const created = addCategory({
      name: newCatName.trim(),
      type: isExp ? 'expense' : 'income',
      isBusiness,
      isEnabled: true,
    });
    setCategory(created.name);
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    if (!accountId) {
      alert('Please select an account');
      return;
    }

    const txData = {
      date,
      type,
      amount: numAmount,
      category: category || 'General',
      isBusiness,
      accountId,
      paymentMethod,
      referenceNo: referenceNo.trim() || undefined,
      partyType: partyType === 'none' ? undefined : partyType,
      partyId: partyId || undefined,
      partyName: partyName.trim() || undefined,
      description: description.trim() || `${category || type.toUpperCase()} (${numAmount} ${settings.currency.symbol})`,
      notes: notes.trim() || undefined,
      receiptImage,
      customFieldValues,
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, txData);
    } else {
      addTransaction(txData);
    }

    onClose();
  };

  if (!isOpen) return null;

  const currentTypeConfig = customTransactionTypes.find((t) => t.id === type);
  const isExpType =
    type === 'expense' ||
    type === 'supplier_payment' ||
    type === 'supplier_credit' ||
    currentTypeConfig?.plEffect === 'expense';

  const filteredCategories = activeCategories.filter((c) =>
    isExpType ? c.type === 'expense' : c.type === 'income'
  );

  // Applicable dynamic custom form fields
  const applicableFields = customFormFields.filter(
    (f) => f.isEnabled && (f.applicableTo === 'all' || (isExpType ? f.applicableTo === 'expense' : f.applicableTo === 'income'))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {editingTransaction ? 'Edit Transaction Record' : 'Record Financial Transaction'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter details with exact accuracy · Dynamic accounting rules apply
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Dynamic Transaction Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Transaction Type
            </label>
            <div className="flex items-center gap-1.5 flex-wrap p-1 bg-slate-950 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
              {activeTypes.map((t) => {
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTypeSelect(t.id as TransactionType)}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span>{t.name}</span>
                    {t.urduLabel && <span className="opacity-75 text-[10px] ml-1">({t.urduLabel})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Field & Quick Rupee Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Amount ({settings.currency.symbol}) <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Accepts 1, 5, 10, 50, 500+</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {settings.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-lg font-bold font-mono text-white placeholder-slate-600"
              />
            </div>

            {/* Quick 1-tap Rupee additions */}
            {settings.formFieldsVisibility.showQuickAmounts && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-slate-500 mr-1">Quick Add:</span>
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAddAmount(val)}
                    className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 cursor-pointer"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date & Time, Account and Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date & Time <span className="text-rose-400">*</span>
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
                Financial Account <span className="text-rose-400">*</span>
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Bal: {settings.currency.symbol} {acc.currentBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional: Payment Method & Reference No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings.formFieldsVisibility.showPaymentMethod && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  {activePaymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.name}>
                      {pm.name} {pm.urduName ? `(${pm.urduName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {settings.formFieldsVisibility.showReferenceNo && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reference / Transaction ID
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. TID-984213, Cheque #492, Invoice #12"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>
            )}
          </div>

          {/* Category with Inline Addition */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{showNewCatInput ? 'Cancel' : 'New Category'}</span>
              </button>
            </div>

            {showNewCatInput ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Courier Charges, LCD Glue, Dongle Refill..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {cat.urduName ? `(${cat.urduName})` : ''} {!cat.isBusiness ? '— Personal' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Business vs Personal Classification */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Financial Classification</p>
              <p className="text-[11px] text-slate-400">
                {isBusiness
                  ? 'Shop Business (Counted in Shop Operating Profit)'
                  : 'Personal / Household (Excluded from Shop Operating Profit)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBusiness(true)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  isBusiness ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Shop Business
              </button>
              <button
                type="button"
                onClick={() => setIsBusiness(false)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  !isBusiness ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Personal / Zaati
              </button>
            </div>
          </div>

          {/* Party (Customer / Supplier) Link */}
          {settings.formFieldsVisibility.showPartyLink && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Party / Contact Link (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={partyType}
                  onChange={(e) => {
                    const val = e.target.value as 'customer' | 'supplier' | 'none';
                    setPartyType(val);
                    setPartyId('');
                  }}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="none">Walk-in / Cash Counter</option>
                  <option value="customer">Customer Khata (Grahak)</option>
                  <option value="supplier">Supplier Khata (Dealer/Wholesaler)</option>
                </select>

                {partyType === 'customer' && (
                  <select
                    value={partyId}
                    onChange={(e) => {
                      setPartyId(e.target.value);
                      const found = activeCustomers.find((c) => c.id === e.target.value);
                      if (found) setPartyName(found.name);
                    }}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">-- Select Customer --</option>
                    {activeCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - Due: {settings.currency.symbol} {c.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}

                {partyType === 'supplier' && (
                  <select
                    value={partyId}
                    onChange={(e) => {
                      setPartyId(e.target.value);
                      const found = activeSuppliers.find((s) => s.id === e.target.value);
                      if (found) setPartyName(found.name);
                    }}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">-- Select Supplier --</option>
                    {activeSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.companyName || s.phone})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {partyType === 'none' && (
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="Person / Walk-in Customer name (Optional)"
                  className="mt-2 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Items / Services
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Samsung A51 Display replacement + OCA Glass"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          {/* Dynamic Custom Form Fields */}
          {applicableFields.length > 0 && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-300 block">
                Additional Custom Form Fields
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {applicableFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {field.label} {field.required && <span className="text-rose-400">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={customFieldValues[field.id] || ''}
                        onChange={(e) =>
                          setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })
                        }
                        required={field.required}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="">-- Select {field.label} --</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={customFieldValues[field.id] || ''}
                        onChange={(e) =>
                          setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })
                        }
                        required={field.required}
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional: Notes */}
          {settings.formFieldsVisibility.showNotes && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 1 month warranty, remaining balance next Monday"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          )}

          {/* Optional: Receipt Photo Upload */}
          {settings.formFieldsVisibility.showReceiptImage && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Receipt / Bill Photo (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>Upload Bill / Slip</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {receiptImage && (
                  <div className="flex items-center gap-2">
                    <img
                      src={receiptImage}
                      alt="Receipt preview"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setReceiptImage(undefined)}
                      className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md cursor-pointer"
            >
              {editingTransaction ? 'Save Changes' : 'Confirm & Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
