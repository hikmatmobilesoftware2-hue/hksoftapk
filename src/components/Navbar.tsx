import React from 'react';
import { Menu, Plus, Lock, Sun, Moon, ArrowRightLeft, Search, Smartphone } from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  activeTab: ActiveTab;
  onOpenSidebar: () => void;
  onOpenNewTransaction: () => void;
  onOpenTransfer: () => void;
  onOpenInstallModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TAB_TITLES: Record<ActiveTab, string> = {
  dashboard: 'Financial Overview',
  income: 'Income Register (Aamdani)',
  expense: 'Expense Register (Kharch)',
  customers: 'Customer Ledger (Khata / Udhaar)',
  suppliers: 'Supplier Ledger (Kharidari / Dena)',
  accounts: 'Cash & Bank Accounts',
  categories: 'Custom Categories Manager',
  transactions: 'All Daily Transactions',
  reports: 'Financial Reports & Analytics',
  backup: 'Database Backup & Restore',
  settings: 'System Settings & Security',
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenSidebar,
  onOpenNewTransaction,
  onOpenTransfer,
  onOpenInstallModal,
  searchQuery,
  setSearchQuery,
}) => {
  const { settings, toggleTheme, lockApp } = useLedger();

  return (
    <header className="h-16 px-4 lg:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Menu toggle & Context Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
            {TAB_TITLES[activeTab]}
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400">
            {settings.shopName} · {settings.currency.symbol}
          </span>
        </div>
      </div>

      {/* Zone 2: Search or contextual quick tools */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search party, description, voucher, amount..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Quick Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenInstallModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          title="Install App / Download APK for Mobile"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Install App / APK</span>
        </button>

        <button
          onClick={onOpenTransfer}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Transfer between Accounts"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>Transfer</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Toggle Dark / Light Theme"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {settings.pinEnabled && (
          <button
            onClick={lockApp}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Lock App"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
        </button>
      </div>
    </header>
  );
};
