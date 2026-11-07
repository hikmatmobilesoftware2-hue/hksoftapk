import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  Truck,
  Wallet,
  ReceiptText,
  BarChart3,
  DatabaseBackup,
  Settings,
  Lock,
  PlusCircle,
  X,
  CreditCard,
  Smartphone,
  Tag,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatPKR } from '../utils/formatters';

export type ActiveTab =
  | 'dashboard'
  | 'income'
  | 'expense'
  | 'customers'
  | 'suppliers'
  | 'accounts'
  | 'categories'
  | 'transactions'
  | 'reports'
  | 'backup'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
  onOpenInstallModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenQuickIncome,
  onOpenQuickExpense,
  onOpenInstallModal,
}) => {
  const { summary, settings, lockApp, categories } = useLedger();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'income' as ActiveTab,
      label: 'Income (Aamdani)',
      icon: TrendingUp,
      badge: formatPKR(summary.todayIncome, true, settings.currency, settings.numberFormat),
    },
    {
      id: 'expense' as ActiveTab,
      label: 'Expenses (Kharch)',
      icon: TrendingDown,
      badge: formatPKR(summary.todayExpense, true, settings.currency, settings.numberFormat),
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Customer Khata (Udhaar)',
      icon: Users,
      badge:
        summary.totalReceivables > 0
          ? formatPKR(summary.totalReceivables, true, settings.currency, settings.numberFormat)
          : undefined,
    },
    {
      id: 'suppliers' as ActiveTab,
      label: 'Supplier Khata (Payables)',
      icon: Truck,
      badge:
        summary.totalPayables > 0
          ? formatPKR(summary.totalPayables, true, settings.currency, settings.numberFormat)
          : undefined,
    },
    { id: 'accounts' as ActiveTab, label: 'Cash & Bank Accounts', icon: Wallet },
    {
      id: 'categories' as ActiveTab,
      label: 'Categories Manager',
      icon: Tag,
      badge: `${categories.filter((c) => !c.isArchived).length}`,
    },
    { id: 'transactions' as ActiveTab, label: 'All Transactions', icon: ReceiptText },
    { id: 'reports' as ActiveTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'backup' as ActiveTab, label: 'Backup & Restore', icon: DatabaseBackup },
    { id: 'settings' as ActiveTab, label: 'Settings & Security', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-8 h-8 rounded-lg object-cover border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tighter">
                HLP
              </div>
            )}
            <div className="truncate">
              <h1 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                {settings.appName || 'HIKMAT LEDGER PRO'}
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase mt-1 truncate">
                {settings.shopName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Transaction Action Buttons */}
        <div className="p-3 border-b border-slate-800/80 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onOpenQuickIncome();
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+ Income</span>
          </button>
          <button
            onClick={() => {
              onOpenQuickExpense();
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>- Expense</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`ml-2 text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status & Lock */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Cash in Hand:</span>
            <span className="font-mono tabular-nums text-emerald-400 font-semibold">
              {formatPKR(summary.totalShopCash, true, settings.currency, settings.numberFormat)}
            </span>
          </div>

          <button
            onClick={() => {
              onOpenInstallModal();
              onClose();
            }}
            className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install App / Download APK</span>
          </button>

          {settings.pinEnabled && (
            <button
              onClick={lockApp}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Lock Application</span>
            </button>
          )}

          <div className="mt-2 text-center text-[10px] text-slate-500">
            {settings.appName || 'HIKMAT LEDGER PRO'} · 100% Offline
          </div>
        </div>
      </aside>
    </>
  );
};
