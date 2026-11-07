import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Download,
  Printer,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatPakDateTime, formatPKR, isThisMonth, isToday } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/export';
import { Transaction } from '../types';

interface IncomeViewProps {
  onOpenIncomeModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  onOpenIncomeModal,
  onEditTransaction,
  onDeleteTransaction,
  onViewTransaction,
}) => {
  const { transactions, accounts, categories } = useLedger();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');

  // Income transactions include direct income and customer payments received
  const incomeTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => tx.type === 'income' || tx.type === 'customer_payment' || tx.type === 'owner_deposit'
    );
  }, [transactions]);

  // Statistics
  const stats = useMemo(() => {
    let today = 0;
    let thisMonth = 0;
    let total = 0;

    incomeTransactions.forEach((tx) => {
      const amt = tx.amount || 0;
      total += amt;
      if (isToday(tx.date)) today += amt;
      if (isThisMonth(tx.date)) thisMonth += amt;
    });

    return { today, thisMonth, total };
  }, [incomeTransactions]);

  // Filtered List
  const filtered = useMemo(() => {
    return incomeTransactions.filter((tx) => {
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

      return matchesSearch && matchesCategory && matchesAccount;
    });
  }, [incomeTransactions, search, selectedCategory, selectedAccount]);

  const handleExportCSV = () => {
    const accMap = accounts.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {});
    exportTransactionsToCSV(filtered, accMap, 'Income_Register');
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Today's Total Income</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-emerald-400">
            {formatPKR(stats.today)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct cash & digital earnings today</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>This Month's Income</span>
            <span className="text-xs font-mono text-slate-500">M-T-D</span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {formatPKR(stats.thisMonth)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Calendar month revenue</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>All Time Income</span>
            <span className="text-xs font-mono text-slate-500">{incomeTransactions.length} entries</span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-blue-400">
            {formatPKR(stats.total)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative registered receipts</p>
        </div>
      </div>

      {/* Main Income Ledger Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search income entries..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              <option value="all">All Income Categories</option>
              {incomeCategories.map((c) => (
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
              <option value="all">All Accounts (Cash/Bank)</option>
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
              title="Download Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Print Table"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onOpenIncomeModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Income</span>
            </button>
          </div>
        </div>

        {/* Income Table */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-slate-400">No income entries found matching criteria.</p>
            <button
              onClick={onOpenIncomeModal}
              className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
            >
              + Record Income
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
                  <th className="py-2.5 px-4">Party / Customer</th>
                  <th className="py-2.5 px-4">Account</th>
                  <th className="py-2.5 px-4">Description / Notes</th>
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
                      <td className="py-2.5 px-4 text-slate-300">
                        {tx.partyName || <span className="text-slate-500">Counter Customer</span>}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {account?.name || '-'}
                      </td>
                      <td className="py-2.5 px-4 max-w-xs text-slate-300 truncate">
                        {tx.description}
                        {tx.notes && <span className="text-slate-500 ml-1">({tx.notes})</span>}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                        +{formatPKR(tx.amount)}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="View Voucher"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Edit Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
