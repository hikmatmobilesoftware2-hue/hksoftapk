import React, { useState, useMemo } from 'react';
import {
  ReceiptText,
  Search,
  Download,
  Printer,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  Plus,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Transaction, TransactionType } from '../types';
import { formatPakDate, formatPakDateTime, formatPKR, isThisMonth, isToday } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/export';

interface TransactionsViewProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onViewTransaction: (tx: Transaction) => void;
  initialSearch?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onViewTransaction,
  initialSearch = '',
}) => {
  const { transactions, archivedTransactions, accounts, categories, customTransactionTypes, settings } = useLedger();

  const [search, setSearch] = useState(initialSearch);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Filter logic
  const filtered = useMemo(() => {
    const list = showArchived ? archivedTransactions : transactions;
    return list.filter((tx) => {
      // 1. Search Query
      const q = search.toLowerCase();
      const matchesSearch =
        q === '' ||
        tx.voucherNo.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        (tx.partyName && tx.partyName.toLowerCase().includes(q)) ||
        (tx.notes && tx.notes.toLowerCase().includes(q)) ||
        String(tx.amount).includes(q);

      // 2. Type Filter
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;

      // 3. Account Filter
      const matchesAccount =
        accountFilter === 'all' || tx.accountId === accountFilter || tx.toAccountId === accountFilter;

      // 4. Category Filter
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

      // 5. Date Filter
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = isToday(tx.date);
      } else if (dateFilter === 'yesterday') {
        const d = new Date(tx.date);
        const y = new Date();
        y.setDate(y.getDate() - 1);
        matchesDate =
          d.getDate() === y.getDate() &&
          d.getMonth() === y.getMonth() &&
          d.getFullYear() === y.getFullYear();
      } else if (dateFilter === 'week') {
        const d = new Date(tx.date).getTime();
        const now = Date.now();
        matchesDate = now - d <= 7 * 86400000;
      } else if (dateFilter === 'month') {
        matchesDate = isThisMonth(tx.date);
      } else if (dateFilter === 'custom' && startDate && endDate) {
        const d = new Date(tx.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = d >= start && d <= end;
      }

      return matchesSearch && matchesType && matchesAccount && matchesCategory && matchesDate;
    });
  }, [transactions, search, typeFilter, accountFilter, categoryFilter, dateFilter, startDate, endDate]);

  const handleExportCSV = () => {
    const accMap = accounts.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {});
    exportTransactionsToCSV(filtered, accMap, `Transactions_${dateFilter}`);
  };

  const totalFilteredAmount = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Daily Transaction Register
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filtered.length} of {transactions.length} total entries · Filtered Volume: {formatPKR(totalFilteredAmount)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV (Excel)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Table</span>
            </button>
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Entry</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search voucher, party, note..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            <option value="all">All Transaction Types</option>
            {customTransactionTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.urduLabel ? `(${t.urduLabel})` : ''}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range Pickers if active */}
        {dateFilter === 'custom' && (
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-3">
            <span className="text-xs text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
            />
            <span className="text-xs text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
            />
          </div>
        )}
      </div>

      {/* Transactions Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No transactions matched your active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Voucher</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Party / Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Account</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Amount (PKR)</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  const isInc =
                    tx.type === 'income' ||
                    tx.type === 'customer_payment' ||
                    tx.type === 'owner_deposit';
                  const isExp =
                    tx.type === 'expense' ||
                    tx.type === 'supplier_payment' ||
                    tx.type === 'owner_withdrawal';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-300">
                        {tx.voucherNo}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatPakDateTime(tx.date)}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            isInc
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isExp
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {tx.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-200 font-medium">
                        {tx.partyName || '-'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{tx.category}</td>
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {account?.name || '-'}
                      </td>
                      <td className="py-2.5 px-4 max-w-xs text-slate-300 truncate">
                        {tx.description}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                        <span
                          className={
                            isInc
                              ? 'text-emerald-400'
                              : isExp
                              ? 'text-rose-400'
                              : 'text-blue-400'
                          }
                        >
                          {isInc ? '+' : isExp ? '-' : ''}
                          {formatPKR(tx.amount)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                            title="View / Print Receipt Slip"
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
