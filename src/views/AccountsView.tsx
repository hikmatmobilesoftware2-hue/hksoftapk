import React, { useState } from 'react';
import {
  Wallet,
  ArrowRightLeft,
  Building,
  Smartphone,
  Plus,
  Eye,
  CreditCard,
  Edit2,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  CheckCircle,
  Archive,
  Layers,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Account, AccountType, Transaction } from '../types';
import { formatPakDateTime, formatPKR } from '../utils/formatters';
import { AccountModal } from '../components/modals/AccountModal';
import { CashAdjustmentModal } from '../components/modals/CashAdjustmentModal';

interface AccountsViewProps {
  onOpenTransferModal: () => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  onOpenTransferModal,
  onViewTransaction,
}) => {
  const {
    accounts,
    transactions,
    deleteAccount,
    unarchiveAccount,
    toggleAccountStatus,
    settings,
  } = useLedger();

  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [showArchived, setShowArchived] = useState(false);

  // Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [isCashAdjustModalOpen, setIsCashAdjustModalOpen] = useState(false);
  const [adjustTargetAccountId, setAdjustTargetAccountId] = useState<string>('');
  const [adjustAction, setAdjustAction] = useState<'add_cash' | 'remove_cash'>('add_cash');

  const [feedback, setFeedback] = useState<string | null>(null);

  const displayedAccounts = accounts.filter((a) => (showArchived ? a.isArchived : !a.isArchived));

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) || displayedAccounts[0] || accounts[0];

  // Transactions affecting this selected account, sorted chronologically for statement calculation
  const accountTransactions = transactions
    .filter((tx) => !tx.isArchived)
    .filter((tx) => tx.accountId === selectedAccount?.id || tx.toAccountId === selectedAccount?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Running balance ledger calculation
  let runningBal = selectedAccount?.initialBalance || 0;
  const statementRows = accountTransactions.map((tx) => {
    const isTransferIn = tx.type === 'transfer' && tx.toAccountId === selectedAccount?.id;
    const isTransferOut = tx.type === 'transfer' && tx.accountId === selectedAccount?.id;

    const isInflow =
      tx.type === 'income' ||
      tx.type === 'customer_payment' ||
      tx.type === 'owner_deposit' ||
      tx.type === 'loan_received' ||
      isTransferIn ||
      (tx.type === 'cash_adjustment' && tx.description.includes('Inflow'));

    const isOutflow =
      tx.type === 'expense' ||
      tx.type === 'supplier_payment' ||
      tx.type === 'owner_withdrawal' ||
      tx.type === 'loan_repayment' ||
      isTransferOut ||
      (tx.type === 'cash_adjustment' && tx.description.includes('Outflow'));

    const amt = Number(tx.amount) || 0;
    if (isInflow) {
      runningBal += amt;
    } else if (isOutflow) {
      runningBal -= amt;
    }

    return {
      tx,
      isInflow,
      isOutflow,
      runningBalance: runningBal,
    };
  }).reverse(); // Display most recent at top

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccount(acc);
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasHistory = transactions.some((t) => t.accountId === acc.id || t.toAccountId === acc.id);
    const confirmMsg = hasHistory
      ? `Account "${acc.name}" has financial transaction history. To protect audit integrity, it will be safely ARCHIVED (hidden from new forms, but historical statement preserved). Proceed?`
      : `Are you sure you want to delete empty account "${acc.name}"?`;

    if (confirm(confirmMsg)) {
      const res = deleteAccount(acc.id);
      if (res.archived) {
        setFeedback(`Account "${acc.name}" safely archived. Historical records remain intact.`);
      } else {
        setFeedback(`Account "${acc.name}" deleted.`);
      }
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleOpenCashAdjust = (accId: string, action: 'add_cash' | 'remove_cash', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAdjustTargetAccountId(accId);
    setAdjustAction(action);
    setIsCashAdjustModalOpen(true);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'shop_cash':
        return <Wallet className="w-5 h-5 text-emerald-400" />;
      case 'personal_cash':
        return <CreditCard className="w-5 h-5 text-purple-400" />;
      case 'bank':
        return <Building className="w-5 h-5 text-blue-400" />;
      case 'wallet':
        return <Smartphone className="w-5 h-5 text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-cyan-400" />;
    }
  };

  const totalAllLiquidCash = accounts
    .filter((a) => !a.isArchived && a.isEnabled !== false)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-medium">Total Liquid Liquidity (Active Accounts)</span>
          <div className="text-3xl font-black font-mono tabular-nums text-white tracking-tight mt-1">
            {formatPKR(totalAllLiquidCash, true, settings.currency, settings.numberFormat)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {accounts.filter((a) => !a.isArchived).length} configured Cash counters, Banks & Wallets
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenCashAdjust(selectedAccount?.id || accounts[0]?.id, 'add_cash')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>+ Add Cash</span>
          </button>
          <button
            onClick={() => handleOpenCashAdjust(selectedAccount?.id || accounts[0]?.id, 'remove_cash')}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>- Remove Cash</span>
          </button>
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Transfer</span>
          </button>
          <button
            onClick={handleOpenAddAccount}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Account</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[11px] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Active vs Archived */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Configured Financial Accounts & Counters
        </h3>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            showArchived
              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {showArchived ? 'Showing Archived Accounts' : 'View Archived Accounts'}
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedAccounts.map((acc) => {
          const isSelected = acc.id === selectedAccount?.id;
          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`p-4.5 rounded-2xl text-left border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      {acc.type.replace('_', ' ')}
                    </span>
                    <button
                      onClick={(e) => handleOpenEditAccount(acc, e)}
                      className="p-1 text-slate-500 hover:text-blue-400 rounded cursor-pointer"
                      title="Edit Account Details"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteAccount(acc, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                      title="Delete / Archive Account"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight truncate">
                  {acc.name}
                </h4>
                {acc.accountNumber && (
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                    {acc.bankName ? `${acc.bankName} · ` : ''}
                    {acc.accountNumber}
                  </p>
                )}
                {acc.notes && (
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{acc.notes}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[10px] text-slate-500">Current Balance</span>
                  <span
                    className={`text-lg font-bold font-mono tabular-nums ${
                      acc.currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPKR(acc.currentBalance, true, settings.currency, settings.numberFormat)}
                  </span>
                </div>

                {/* Quick Add / Remove Buttons per account */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/40">
                  <button
                    onClick={(e) => handleOpenCashAdjust(acc.id, 'add_cash', e)}
                    className="py-1 px-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-[10px] font-semibold text-emerald-300 text-center cursor-pointer"
                  >
                    + Add Cash
                  </button>
                  <button
                    onClick={(e) => handleOpenCashAdjust(acc.id, 'remove_cash', e)}
                    className="py-1 px-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-[10px] font-semibold text-rose-300 text-center cursor-pointer"
                  >
                    - Withdraw
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Ledger Statement with Running Balance */}
      {selectedAccount && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Account Statement: {selectedAccount.name}</span>
                {selectedAccount.isArchived && (
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-semibold border border-amber-800">
                    Archived
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Opening Balance:{' '}
                {formatPKR(selectedAccount.initialBalance, true, settings.currency, settings.numberFormat)}{' '}
                · Current Balance:{' '}
                {formatPKR(selectedAccount.currentBalance, true, settings.currency, settings.numberFormat)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenCashAdjust(selectedAccount.id, 'add_cash')}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg font-medium cursor-pointer"
              >
                + Cash In
              </button>
              <button
                onClick={() => handleOpenCashAdjust(selectedAccount.id, 'remove_cash')}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg font-medium cursor-pointer"
              >
                - Cash Out
              </button>
              <button
                onClick={onOpenTransferModal}
                className="text-xs px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium cursor-pointer"
              >
                Transfer ➔
              </button>
            </div>
          </div>

          {statementRows.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No transactions recorded for this account yet. Click "+ Add Cash" to record opening funds or initial transactions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                    <th className="py-2.5 px-4">Voucher</th>
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Transaction Details</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4 text-right">Inflow (+)</th>
                    <th className="py-2.5 px-4 text-right">Outflow (-)</th>
                    <th className="py-2.5 px-4 text-right">Running Balance</th>
                    <th className="py-2.5 px-4 text-center">Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {statementRows.map(({ tx, isInflow, isOutflow, runningBalance }) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-300">
                        {tx.voucherNo}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatPakDateTime(tx.date, settings.dateFormat)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-200">
                        <div className="font-medium">{tx.description}</div>
                        {tx.partyName && (
                          <span className="text-[11px] text-slate-400">Party: {tx.partyName}</span>
                        )}
                        {tx.notes && (
                          <span className="text-[10px] text-slate-500 block">{tx.notes}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 uppercase text-[10px] font-semibold whitespace-nowrap">
                        {tx.type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                        {isInflow
                          ? `+${formatPKR(tx.amount, true, settings.currency, settings.numberFormat)}`
                          : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-400 tabular-nums">
                        {isOutflow
                          ? `-${formatPKR(tx.amount, true, settings.currency, settings.numberFormat)}`
                          : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {formatPKR(runningBalance, true, settings.currency, settings.numberFormat)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => onViewTransaction(tx)}
                          className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Account Modal (Create & Edit) */}
      {isAccountModalOpen && (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          editingAccount={editingAccount}
        />
      )}

      {/* Cash Adjustment Modal (Cash In & Out) */}
      {isCashAdjustModalOpen && (
        <CashAdjustmentModal
          isOpen={isCashAdjustModalOpen}
          onClose={() => setIsCashAdjustModalOpen(false)}
          defaultAccountId={adjustTargetAccountId}
          defaultAction={adjustAction}
        />
      )}
    </div>
  );
};
