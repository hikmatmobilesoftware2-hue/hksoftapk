import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Building,
  Users,
  Truck,
  ArrowRightLeft,
  Plus,
  Eye,
  Share2,
  Calendar,
  Smartphone,
  Sliders,
  ArrowDownRight,
  ArrowUpRight,
  BarChart,
  ShieldCheck,
  User,
  CreditCard,
  CreditCard as CreditCardIcon,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatPakDate, formatPakDateTime, formatPKR, isToday } from '../utils/formatters';
import { generateDailySummaryShareText } from '../utils/export';
import { DashboardCardConfig, Transaction } from '../types';
import { DashboardCustomizerModal } from '../components/modals/DashboardCustomizerModal';
import { CashAdjustmentModal } from '../components/modals/CashAdjustmentModal';

interface DashboardViewProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenTransferModal: () => void;
  onOpenInstallModal: () => void;
  onViewTransaction: (tx: Transaction) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenTransferModal,
  onOpenInstallModal,
  onViewTransaction,
  onNavigateTab,
}) => {
  const { summary, transactions, accounts, settings } = useLedger();

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCashAdjustOpen, setIsCashAdjustOpen] = useState(false);
  const [cashAdjustAction, setCashAdjustAction] = useState<'add_cash' | 'remove_cash'>('add_cash');

  const recentTransactions = transactions.filter((t) => !t.isArchived).slice(0, 8);

  const handleShareDailyReport = () => {
    const text = encodeURIComponent(generateDailySummaryShareText(summary, settings.shopName));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleOpenCashAdjust = (action: 'add_cash' | 'remove_cash') => {
    setCashAdjustAction(action);
    setIsCashAdjustOpen(true);
  };

  // Helper to get numeric metric value from key
  const getMetricValue = (key: string): number => {
    return (summary as any)[key] ?? 0;
  };

  const getMetricIcon = (iconName?: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'TrendingDown':
        return <TrendingDown className="w-4 h-4 text-rose-400" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4 text-blue-400" />;
      case 'Wallet':
        return <Wallet className="w-4 h-4 text-amber-400" />;
      case 'Building':
        return <Building className="w-4 h-4 text-blue-400" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'Users':
        return <Users className="w-4 h-4 text-amber-400" />;
      case 'Truck':
        return <Truck className="w-4 h-4 text-purple-400" />;
      case 'User':
        return <User className="w-4 h-4 text-purple-400" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      case 'BarChart':
        return <BarChart className="w-4 h-4 text-cyan-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-teal-400" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 text-slate-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-blue-400" />;
    }
  };

  // Filter visible cards based on user settings
  const visibleCards = settings.dashboard.cards.filter((card) => {
    if (!card.isEnabled) return false;
    if (card.category === 'shop' && !settings.dashboard.showShopStats) return false;
    if (card.category === 'personal' && !settings.dashboard.showPersonalStats) return false;
    return true;
  });

  const getGridColsClass = () => {
    if (settings.dashboard.layoutMode === 'compact') {
      return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
    }
    if (settings.dashboard.layoutMode === 'grid_3') {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Today: {formatPakDate(new Date(), settings.dateFormat)}</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">100% Dynamic Engine Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {settings.shopName || settings.appName}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {settings.tagline || 'Shop & Personal Finance Management System'} · {settings.developerName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenIncomeModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>+ Income</span>
          </button>
          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <TrendingDown className="w-4 h-4" />
            <span>- Expense</span>
          </button>
          <button
            onClick={() => handleOpenCashAdjust('add_cash')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Manual Cash Adjustment"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Cash In/Out</span>
          </button>
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Customize Dashboard Cards & Layout"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Customize</span>
          </button>
          <button
            onClick={handleShareDailyReport}
            className="p-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl transition-colors cursor-pointer"
            title="Share Daily Summary on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Customizable KPI Grid */}
      <div className={`grid gap-4 ${getGridColsClass()}`}>
        {visibleCards.map((card) => {
          const val = getMetricValue(card.metricKey);
          const isProfit = card.metricKey.toLowerCase().includes('profit');
          const isExpense = card.metricKey.toLowerCase().includes('expense') || card.metricKey.toLowerCase().includes('payable');

          return (
            <div
              key={card.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-medium truncate mr-2">{card.title}</span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-800"
                    style={{ backgroundColor: `${card.color || '#3B82F6'}15` }}
                  >
                    {getMetricIcon(card.icon)}
                  </div>
                </div>

                <div
                  className={`text-2xl font-black font-mono tabular-nums tracking-tight ${
                    isProfit
                      ? val >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                      : isExpense
                      ? 'text-rose-400'
                      : 'text-white'
                  }`}
                >
                  {formatPKR(val, true, settings.currency, settings.numberFormat)}
                </div>
              </div>

              {card.urduTitle && (
                <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{card.urduTitle}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    {card.category}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Financial Accounts Snapshot Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Active Financial Accounts & Wallets</h3>
            <p className="text-xs text-slate-400">Current liquid cash balances and cash counters</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenCashAdjust('add_cash')}
              className="text-xs px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg font-medium cursor-pointer"
            >
              + Cash In
            </button>
            <button
              onClick={() => handleOpenCashAdjust('remove_cash')}
              className="text-xs px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg font-medium cursor-pointer"
            >
              - Cash Out
            </button>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium ml-2 cursor-pointer"
            >
              Manage Accounts →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {accounts
            .filter((a) => !a.isArchived && a.isEnabled !== false)
            .map((acc) => (
              <div
                key={acc.id}
                onClick={() => onNavigateTab('accounts')}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="truncate mr-2">
                  <span className="text-xs font-semibold text-slate-200 block truncate">
                    {acc.name}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mt-0.5">
                    {acc.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold font-mono tabular-nums block ${
                      acc.currentBalance >= 0 ? 'text-white' : 'text-rose-400'
                    }`}
                  >
                    {formatPKR(acc.currentBalance, true, settings.currency, settings.numberFormat)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Financial Activity</h3>
            <p className="text-xs text-slate-400">Latest audited ledger records and cash flow</p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
          >
            View All ({transactions.filter((t) => !t.isArchived).length}) →
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-slate-400">No transactions recorded yet.</p>
            <button
              onClick={onOpenIncomeModal}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Record First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Voucher</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Description / Party</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Account / Method</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTransactions.map((tx) => {
                  const isInc =
                    tx.type === 'income' ||
                    tx.type === 'customer_payment' ||
                    tx.type === 'owner_deposit' ||
                    tx.type === 'loan_received' ||
                    (tx.type === 'cash_adjustment' && tx.description.includes('Inflow'));

                  const isExp =
                    tx.type === 'expense' ||
                    tx.type === 'supplier_payment' ||
                    tx.type === 'owner_withdrawal' ||
                    tx.type === 'loan_repayment' ||
                    (tx.type === 'cash_adjustment' && tx.description.includes('Outflow'));

                  const account = accounts.find((a) => a.id === tx.accountId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-300">
                        {tx.voucherNo}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatPakDateTime(tx.date, settings.dateFormat)}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-200">
                          {tx.partyName || tx.description}
                        </div>
                        {tx.partyName && tx.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{tx.category}</td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {account?.name || tx.paymentMethod || '-'}
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
                          {formatPKR(tx.amount, true, settings.currency, settings.numberFormat)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => onViewTransaction(tx)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View / Print Receipt Slip"
                        >
                          <Eye className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dashboard Customizer Modal */}
      {isCustomizerOpen && (
        <DashboardCustomizerModal
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* Cash Adjustment Modal */}
      {isCashAdjustOpen && (
        <CashAdjustmentModal
          isOpen={isCashAdjustOpen}
          onClose={() => setIsCashAdjustOpen(false)}
          defaultAction={cashAdjustAction}
        />
      )}
    </div>
  );
};
