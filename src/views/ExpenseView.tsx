import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Plus,
  Download,
  Printer,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatPakDateTime, formatPKR, isThisMonth, isToday } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/export';
import { Transaction } from '../types';

interface ExpenseViewProps {
  onOpenExpenseModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({
  onOpenExpenseModal,
  onEditTransaction,
  onDeleteTransaction,
  onViewTransaction,
}) => {
  const { transactions, accounts, categories } = useLedger();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClassification, setSelectedClassification] = useState<'all' | 'business' | 'personal'>('all');
  const [selectedAccount, setSelectedAccount] = useState('all');

  const expenseTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => tx.type === 'expense' || tx.type === 'supplier_payment' || tx.type === 'owner_withdrawal'
    );
  }, [transactions]);

  // Statistics
  const stats = useMemo(() => {
    let todayBusiness = 0;
    let todayPersonal = 0;
    let monthBusiness = 0;
    let totalBusiness = 0;
    let totalPersonal = 0;

    expenseTransactions.forEach((tx) => {
      const amt = tx.amount || 0;
      if (tx.isBusiness) {
        totalBusiness += amt;
        if (isToday(tx.date)) todayBusiness += amt;
        if (isThisMonth(tx.date)) monthBusiness += amt;
      } else {
        totalPersonal += amt;
        if (isToday(tx.date)) todayPersonal += amt;
      }
    });

    return { todayBusiness, todayPersonal, monthBusiness, totalBusiness, totalPersonal };
  }, [expenseTransactions]);

  // Filtered
  const filtered = useMemo(() => {
    return expenseTransactions.filter((tx) => {
      const matchesSearch =
        search === '' ||
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        (tx.partyName && tx.partyName.toLowerCase().includes(search.toLowerCase())) ||
        tx.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
        String(tx.amount).includes(search);

      const matchesCategory =
        selectedCategory === 'all' || tx.category === selectedCategory;

      const matchesAccount =
        selectedAccount === 'all' || tx.accountId === selectedAccount;

      const matchesClass =
        selectedClassification === 'all' ||
        (selectedClassification === 'business' ? tx.isBusiness : !tx.isBusiness);

      return matchesSearch && matchesCategory && matchesAccount && matchesClass;
    });
  }, [expenseTransactions, search, selectedCategory, selectedAccount, selectedClassification]);

  const handleExportCSV = () => {
    const accMap = accounts.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {});
    exportTransactionsToCSV(filtered, accMap, 'Expense_Register');
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Today's Business Expenses</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-rose-400">
            {formatPKR(stats.todayBusiness)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
            <span>Shop Operations & Spares</span>
            {stats.todayPersonal > 0 && (
              <span className="text-purple-400">+{formatPKR(stats.todayPersonal)} Personal</span>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>This Month's Business Expenses</span>
            <span className="text-xs font-mono text-slate-500">M-T-D</span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {formatPKR(stats.monthBusiness)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Directly deducted from profit</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Business Expenses</span>
            <span className="text-xs font-mono text-slate-500">{expenseTransactions.length} entries</span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-purple-400">
            {formatPKR(stats.totalBusiness)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative operating expenditure</p>
        </div>
      </div>

      {/* Main Expense Ledger Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="relative min-w-[180px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expenses, tea, bills..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white"
              />
            </div>

            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              <option value="all">All Classifications</option>
              <option value="business">Shop Business Only</option>
              <option value="personal">Personal / Zaati Only</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              <option value="all">All Categories</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Expense</span>
            </button>
          </div>
        </div>

        {/* Expense Table */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-slate-400">No expense records found matching criteria.</p>
            <button
              onClick={onOpenExpenseModal}
              className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
            >
              + Record Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Voucher</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Classification</th>
                  <th className="py-2.5 px-4">Account</th>
                  <th className="py-2.5 px-4">Description / Notes</th>
                  <th className="py-2.5 px-4 text-center">Slip</th>
                  <th className="py-2.5 px-4 text-right">Amount (PKR)</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-300">
                        {tx.voucherNo}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatPakDateTime(tx.date)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-slate-200 font-medium">{tx.category}</span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            tx.isBusiness
                              ? 'bg-blue-900/40 text-blue-300 border border-blue-800'
                              : 'bg-purple-900/40 text-purple-300 border border-purple-800'
                          }`}
                        >
                          {tx.isBusiness ? 'Shop Business' : 'Personal / Home'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {account?.name || '-'}
                      </td>
                      <td className="py-2.5 px-4 max-w-xs text-slate-300 truncate">
                        {tx.description}
                        {tx.partyName && <span className="text-slate-400 ml-1">· {tx.partyName}</span>}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {tx.receiptImage ? (
                          <button
                            onClick={() => onViewTransaction(tx)}
                            className="p-1 rounded text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                            title="View Attached Slip"
                          >
                            <ImageIcon className="w-4 h-4 mx-auto" />
                          </button>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-400 tabular-nums whitespace-nowrap">
                        -{formatPKR(tx.amount)}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                            title="View Voucher"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                            title="Edit Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
