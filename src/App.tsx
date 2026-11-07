/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LedgerProvider, useLedger } from './context/LedgerContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PinLockModal } from './components/PinLockModal';

// Modals
import { TransactionModal } from './components/modals/TransactionModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { SupplierModal } from './components/modals/SupplierModal';
import { TransferModal } from './components/modals/TransferModal';
import { ReceiptVoucherModal } from './components/modals/ReceiptVoucherModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { InstallApkModal } from './components/modals/InstallApkModal';
import { OfflineIndicator } from './components/OfflineIndicator';

// Views
import { DashboardView } from './views/DashboardView';
import { IncomeView } from './views/IncomeView';
import { ExpenseView } from './views/ExpenseView';
import { CustomerLedgerView } from './views/CustomerLedgerView';
import { SupplierLedgerView } from './views/SupplierLedgerView';
import { AccountsView } from './views/AccountsView';
import { TransactionsView } from './views/TransactionsView';
import { ReportsView } from './views/ReportsView';
import { BackupRestoreView } from './views/BackupRestoreView';
import { SettingsView } from './views/SettingsView';
import { CategoriesView } from './views/CategoriesView';

import { Customer, Supplier, Transaction, TransactionType } from './types';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  Menu,
  Smartphone,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAppLocked, deleteTransaction, deleteCustomer, deleteSupplier } = useLedger();

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [partyLinkInfo, setPartyLinkInfo] = useState<{
    partyId?: string;
    partyType?: 'customer' | 'supplier';
    partyName?: string;
  }>({});

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);

  // Deletion Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'transaction' | 'customer' | 'supplier';
    id: string;
    title: string;
    description: string;
    details?: { voucherNo?: string; amount?: number; partyName?: string };
  } | null>(null);

  // Quick Action Handlers
  const handleOpenNewTransaction = (
    type: TransactionType = 'income',
    partyInfo?: { partyId?: string; partyType?: 'customer' | 'supplier'; partyName?: string }
  ) => {
    setEditingTransaction(null);
    setTxModalType(type);
    setPartyLinkInfo(partyInfo || {});
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxModalType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setDeleteTarget({
      type: 'transaction',
      id: tx.id,
      title: 'Delete Financial Transaction?',
      description: 'Are you sure you want to delete this record? All linked balances and reports will be automatically recalculated.',
      details: {
        voucherNo: tx.voucherNo,
        amount: tx.amount,
        partyName: tx.partyName || tx.description,
      },
    });
  };

  const handleDeleteCustomer = (cust: Customer) => {
    setDeleteTarget({
      type: 'customer',
      id: cust.id,
      title: `Delete Customer "${cust.name}"?`,
      description: `Deleting this customer will remove their Khata record. Any outstanding balance of ${cust.balance} PKR will be removed.`,
    });
  };

  const handleDeleteSupplier = (sup: Supplier) => {
    setDeleteTarget({
      type: 'supplier',
      id: sup.id,
      title: `Delete Supplier "${sup.name}"?`,
      description: `Deleting this vendor will remove their profile and payable record.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'transaction') {
      deleteTransaction(deleteTarget.id);
    } else if (deleteTarget.type === 'customer') {
      deleteCustomer(deleteTarget.id);
    } else if (deleteTarget.type === 'supplier') {
      deleteSupplier(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* PIN Lock Screen if locked */}
      {isAppLocked && <PinLockModal />}

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenQuickIncome={() => handleOpenNewTransaction('income')}
        onOpenQuickExpense={() => handleOpenNewTransaction('expense')}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Header */}
        <Navbar
          activeTab={activeTab}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNewTransaction={() => handleOpenNewTransaction('income')}
          onOpenTransfer={() => setIsTransferModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenIncomeModal={() => handleOpenNewTransaction('income')}
              onOpenExpenseModal={() => handleOpenNewTransaction('expense')}
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              onViewTransaction={(tx) => setViewingTransaction(tx)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              onOpenIncomeModal={() => handleOpenNewTransaction('income')}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onViewTransaction={(tx) => setViewingTransaction(tx)}
            />
          )}

          {activeTab === 'expense' && (
            <ExpenseView
              onOpenExpenseModal={() => handleOpenNewTransaction('expense')}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onViewTransaction={(tx) => setViewingTransaction(tx)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerLedgerView
              onOpenCustomerModal={(cust) => {
                setEditingCustomer(cust || null);
                setIsCustomerModalOpen(true);
              }}
              onOpenCreditModal={(cust) => {
                handleOpenNewTransaction('customer_credit', {
                  partyId: cust.id,
                  partyType: 'customer',
                  partyName: cust.name,
                });
              }}
              onOpenPaymentModal={(cust) => {
                handleOpenNewTransaction('customer_payment', {
                  partyId: cust.id,
                  partyType: 'customer',
                  partyName: cust.name,
                });
              }}
              onDeleteCustomer={handleDeleteCustomer}
              onViewTransaction={(tx) => setViewingTransaction(tx)}
            />
          )}

          {activeTab === 'suppliers' && (
            <SupplierLedgerView
              onOpenSupplierModal={(sup) => {
                setEditingSupplier(sup || null);
                setIsSupplierModalOpen(true);
              }}
              onOpenPurchaseModal={(sup) => {
                handleOpenNewTransaction('supplier_credit', {
                  partyId: sup.id,
                  partyType: 'supplier',
                  partyName: sup.name,
                });
              }}
              onOpenPaymentModal={(sup) => {
                handleOpenNewTransaction('supplier_payment', {
                  partyId: sup.id,
                  partyType: 'supplier',
                  partyName: sup.name,
                });
              }}
              onDeleteSupplier={handleDeleteSupplier}
              onViewTransaction={(tx) => setViewingTransaction(tx)}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
              onViewTransaction={(tx) => setViewingTransaction(tx)}
            />
          )}

          {activeTab === 'categories' && <CategoriesView />}

          {activeTab === 'transactions' && (
            <TransactionsView
              initialSearch={searchQuery}
              onOpenNewTransaction={() => handleOpenNewTransaction('income')}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onViewTransaction={(tx) => setViewingTransaction(tx)}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'backup' && <BackupRestoreView />}

          {activeTab === 'settings' && (
            <SettingsView onOpenInstallModal={() => setIsInstallModalOpen(true)} />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
        <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium ${
              activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium ${
              activeTab === 'income' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-4 h-4 mb-0.5" />
            <span>Income</span>
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium ${
              activeTab === 'expense' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <TrendingDown className="w-4 h-4 mb-0.5" />
            <span>Expense</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium ${
              activeTab === 'customers' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Khata</span>
          </button>
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-emerald-400"
          >
            <Smartphone className="w-4 h-4 mb-0.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-slate-400"
          >
            <Menu className="w-4 h-4 mb-0.5" />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* Global Modals & Indicators */}
      <OfflineIndicator />

      <InstallApkModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txModalType}
        editingTransaction={editingTransaction}
        defaultPartyId={partyLinkInfo.partyId}
        defaultPartyType={partyLinkInfo.partyType}
        defaultPartyName={partyLinkInfo.partyName}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        editingCustomer={editingCustomer}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setEditingSupplier(null);
        }}
        editingSupplier={editingSupplier}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <ReceiptVoucherModal
        isOpen={!!viewingTransaction}
        onClose={() => setViewingTransaction(null)}
        transaction={viewingTransaction}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.title || 'Confirm Delete'}
        description={deleteTarget?.description || ''}
        itemDetails={deleteTarget?.details}
      />
    </div>
  );
};

export default function App() {
  return (
    <LedgerProvider>
      <MainApp />
    </LedgerProvider>
  );
}
