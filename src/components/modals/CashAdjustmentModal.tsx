import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, DollarSign, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { formatPKR, toDatetimeLocal } from '../../utils/formatters';

interface CashAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccountId?: string;
  defaultAction?: 'add_cash' | 'remove_cash';
}

export const CashAdjustmentModal: React.FC<CashAdjustmentModalProps> = ({
  isOpen,
  onClose,
  defaultAccountId,
  defaultAction = 'add_cash',
}) => {
  const { accounts, adjustCash, settings } = useLedger();

  const [accountId, setAccountId] = useState(defaultAccountId || accounts[0]?.id || '');
  const [actionType, setActionType] = useState<'add_cash' | 'remove_cash'>(defaultAction);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('Counter Drawer Cash Inflow');
  const [customReason, setCustomReason] = useState('');
  const [date, setDate] = useState(toDatetimeLocal());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (defaultAccountId) setAccountId(defaultAccountId);
    setActionType(defaultAction);
    setAmount('');
    setDate(toDatetimeLocal());
    setNotes('');
    setCustomReason('');
    setReason(
      defaultAction === 'add_cash'
        ? 'Counter Drawer Cash Inflow / Refill'
        : 'Counter Cash Withdrawn to Safe / Pocket'
    );
  }, [isOpen, defaultAccountId, defaultAction]);

  if (!isOpen) return null;

  const targetAccount = accounts.find((a) => a.id === accountId) || accounts[0];
  const currentBalance = targetAccount?.currentBalance || 0;
  const numAmount = parseFloat(amount) || 0;
  const projectedBalance =
    actionType === 'add_cash'
      ? currentBalance + numAmount
      : currentBalance - numAmount;

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000, 50000];

  const commonReasonsAdd = [
    'Counter Drawer Cash Inflow / Refill',
    'Drawer Opening Float Adjustment',
    'Emergency Cash Inflow for Change',
    'Physical Cash Surplus Reconciliation',
    'Bank Cash Withdrawal into Shop Drawer',
    'Other Custom Reason',
  ];

  const commonReasonsRemove = [
    'Counter Cash Withdrawn to Safe / Vault',
    'Owner Personal Cash Draw from Drawer',
    'Cash Transferred for Wholesale Shopping',
    'Physical Cash Shortage Reconciliation',
    'End of Day Surplus Removal',
    'Other Custom Reason',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('Please enter a valid cash amount greater than zero.');
      return;
    }
    if (!accountId) {
      alert('Please select an account.');
      return;
    }

    const finalReason = reason === 'Other Custom Reason' ? customReason.trim() || 'Manual Adjustment' : reason;

    adjustCash({
      accountId,
      amount: numAmount,
      actionType,
      reason: finalReason,
      date,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                actionType === 'add_cash'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {actionType === 'add_cash' ? (
                <ArrowDownRight className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {actionType === 'add_cash' ? 'Add Cash (Cash In)' : 'Remove Cash (Cash Out)'}
              </h3>
              <p className="text-xs text-slate-400">
                Audited manual cash balance adjustment for accountability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Selector: Add Cash vs Remove Cash */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Adjustment Operation
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActionType('add_cash');
                  setReason(commonReasonsAdd[0]);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  actionType === 'add_cash'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>+ Add Cash (Jama)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionType('remove_cash');
                  setReason(commonReasonsRemove[0]);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  actionType === 'remove_cash'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>- Remove Cash (Nikalna)</span>
              </button>
            </div>
          </div>

          {/* Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Target Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            >
              {accounts
                .filter((a) => !a.isArchived)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Current: {formatPKR(acc.currentBalance, true, settings.currency, settings.numberFormat)}
                  </option>
                ))}
            </select>
          </div>

          {/* Amount Input & Live Balance Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Cash Amount to {actionType === 'add_cash' ? 'Add' : 'Remove'}{' '}
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Exact Rupee Precision</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
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
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-lg font-bold font-mono text-white placeholder-slate-600"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-500 mr-1">Quick:</span>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 cursor-pointer"
                >
                  {q.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Live Balance Impact Card */}
            <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Current Balance</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatPKR(currentBalance, true, settings.currency, settings.numberFormat)}
                </span>
              </div>
              <span className="text-slate-600 font-bold">➔</span>
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">New Projected Balance</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    projectedBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatPKR(projectedBalance, true, settings.currency, settings.numberFormat)}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Adjustment Reason <span className="text-rose-400">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            >
              {(actionType === 'add_cash' ? commonReasonsAdd : commonReasonsRemove).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {reason === 'Other Custom Reason' && (
              <input
                type="text"
                required
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Type specific reason for cash adjustment..."
                className="mt-2 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Audit Status
              </label>
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audited in History</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Audit Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Counted in presence of shopkeeper at night closing"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-colors cursor-pointer ${
                actionType === 'add_cash'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {actionType === 'add_cash' ? 'Confirm Add Cash (+)' : 'Confirm Remove Cash (-)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
