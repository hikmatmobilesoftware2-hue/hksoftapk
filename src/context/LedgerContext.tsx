import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  AppSettings,
  AuditLog,
  Category,
  CustomFormField,
  CustomTransactionType,
  Customer,
  DashboardCardConfig,
  DashboardSettings,
  FinancialSummary,
  PaymentMethod,
  Supplier,
  Transaction,
  TransactionType,
} from '../types';
import { isThisMonth, isToday } from '../utils/formatters';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_CUSTOM_FORM_FIELDS,
  DEFAULT_CUSTOMERS,
  DEFAULT_DASHBOARD_CARDS,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_SETTINGS,
  DEFAULT_SUPPLIERS,
  DEFAULT_TRANSACTION_TYPES,
  DEFAULT_TRANSACTIONS,
} from '../utils/initialData';

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  label: string;
  transactionCount: number;
  data: string;
}

interface LedgerContextType {
  // Data State
  accounts: Account[];
  transactions: Transaction[];
  archivedTransactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  categories: Category[];
  customTransactionTypes: CustomTransactionType[];
  paymentMethods: PaymentMethod[];
  customFormFields: CustomFormField[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  summary: FinancialSummary;
  isAppLocked: boolean;
  backups: BackupSnapshot[];

  // App & Security
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  // Transactions CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'voucherNo' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteSelectedTransactions: (ids: string[]) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  archiveTransactionsBeforeDate: (beforeDateIso: string) => number;
  recoverArchivedTransactions: (ids?: string[]) => void;
  exportFilteredTransactions: (criteria: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    categoryId?: string;
    type?: string;
  }) => Transaction[];

  // Customers CRUD & Archival
  addCustomer: (cust: Omit<Customer, 'id' | 'totalCreditGiven' | 'totalPaymentReceived' | 'balance' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => { success: boolean; archived: boolean };
  unarchiveCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;

  // Suppliers CRUD & Archival
  addSupplier: (sup: Omit<Supplier, 'id' | 'totalPurchases' | 'totalPaid' | 'balance' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => { success: boolean; archived: boolean };
  unarchiveSupplier: (id: string) => void;
  getSupplierById: (id: string) => Supplier | undefined;

  // Accounts CRUD & Cash Management
  addAccount: (acc: Omit<Account, 'id' | 'currentBalance'>) => Account;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => { success: boolean; archived: boolean };
  unarchiveAccount: (id: string) => void;
  toggleAccountStatus: (id: string) => void;
  adjustCash: (params: {
    accountId: string;
    amount: number;
    actionType: 'add_cash' | 'remove_cash' | 'reconciliation';
    reason: string;
    date: string;
    notes?: string;
  }) => Transaction;
  transferFunds: (params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description: string;
    date: string;
    paymentMethod?: string;
  }) => void;

  // Categories CRUD
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; archived: boolean };
  unarchiveCategory: (id: string) => void;
  toggleCategoryStatus: (id: string) => void;
  reorderCategories: (newOrder: Category[]) => void;

  // Custom Transaction Types
  addCustomTransactionType: (t: Omit<CustomTransactionType, 'id'>) => CustomTransactionType;
  updateCustomTransactionType: (id: string, t: Partial<CustomTransactionType>) => void;
  deleteCustomTransactionType: (id: string) => void;
  toggleCustomTransactionType: (id: string) => void;

  // Payment Methods
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => PaymentMethod;
  updatePaymentMethod: (id: string, pm: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  togglePaymentMethod: (id: string) => void;
  reorderPaymentMethods: (newOrder: PaymentMethod[]) => void;

  // Custom Form Fields
  addCustomFormField: (field: Omit<CustomFormField, 'id'>) => CustomFormField;
  updateCustomFormField: (id: string, field: Partial<CustomFormField>) => void;
  deleteCustomFormField: (id: string) => void;
  toggleCustomFormField: (id: string) => void;

  // Dashboard Settings
  updateDashboardSettings: (newSettings: Partial<DashboardSettings>) => void;
  reorderDashboardCards: (cards: DashboardCardConfig[]) => void;
  toggleDashboardCard: (cardId: string) => void;

  // Audit Logs
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearAuditLogs: () => void;

  // Backup & Restore
  createManualBackup: (label?: string) => void;
  restoreFromJSON: (jsonString: string) => { success: boolean; error?: string };
  exportDatabaseJSON: () => string;
  resetDatabase: () => void;
  loadSampleData: () => void;
}

const STORAGE_KEYS = {
  ACCOUNTS: 'hlp_accounts_v2',
  TRANSACTIONS: 'hlp_transactions_v2',
  ARCHIVED_TXS: 'hlp_archived_txs_v2',
  CUSTOMERS: 'hlp_customers_v2',
  SUPPLIERS: 'hlp_suppliers_v2',
  CATEGORIES: 'hlp_categories_v2',
  CUSTOM_TYPES: 'hlp_custom_types_v2',
  PAYMENT_METHODS: 'hlp_payment_methods_v2',
  CUSTOM_FIELDS: 'hlp_custom_fields_v2',
  SETTINGS: 'hlp_settings_v2',
  AUDIT_LOGS: 'hlp_audit_logs_v2',
  BACKUPS: 'hlp_backups_v2',
  LOCK_STATE: 'hlp_lock_state_v2',
};

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Accounts
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || localStorage.getItem('hlp_accounts_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((a: any) => ({
          ...a,
          isEnabled: a.isEnabled !== false,
          isArchived: a.isArchived === true,
        }));
      } catch (e) {}
    }
    return DEFAULT_ACCOUNTS;
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || localStorage.getItem('hlp_transactions_v1');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  // Archived Transactions
  const [archivedTransactions, setArchivedTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARCHIVED_TXS);
    return saved ? JSON.parse(saved) : [];
  });

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || localStorage.getItem('hlp_customers_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({ ...c, isArchived: c.isArchived === true }));
      } catch (e) {}
    }
    return DEFAULT_CUSTOMERS;
  });

  // Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || localStorage.getItem('hlp_suppliers_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({ ...s, isArchived: s.isArchived === true }));
      } catch (e) {}
    }
    return DEFAULT_SUPPLIERS;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES) || localStorage.getItem('hlp_categories_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any, index: number) => ({
          ...c,
          isEnabled: c.isEnabled !== false,
          isArchived: c.isArchived === true,
          orderIndex: c.orderIndex ?? index,
        }));
      } catch (e) {}
    }
    return DEFAULT_CATEGORIES;
  });

  // Custom Transaction Types
  const [customTransactionTypes, setCustomTransactionTypes] = useState<CustomTransactionType[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_TYPES);
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTION_TYPES;
  });

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_METHODS;
  });

  // Custom Form Fields
  const [customFormFields, setCustomFormFields] = useState<CustomFormField[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS);
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_FORM_FIELDS;
  });

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem('hlp_settings_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          currency: { ...DEFAULT_SETTINGS.currency, ...(parsed.currency || {}) },
          formFieldsVisibility: { ...DEFAULT_SETTINGS.formFieldsVisibility, ...(parsed.formFieldsVisibility || {}) },
          dashboard: {
            ...DEFAULT_SETTINGS.dashboard,
            ...(parsed.dashboard || {}),
            cards: parsed.dashboard?.cards || DEFAULT_DASHBOARD_CARDS,
          },
        };
      } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  // Backups
  const [backups, setBackups] = useState<BackupSnapshot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BACKUPS) || localStorage.getItem('hlp_backups_v1');
    return saved ? JSON.parse(saved) : [];
  });

  // Lock State
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCK_STATE);
    const pinOn = settings.pinEnabled;
    return pinOn && saved === 'true';
  });

  // Sync theme & accent to html element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark' || settings.theme === 'amoled') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (settings.theme === 'amoled') {
      root.classList.add('amoled-mode');
    } else {
      root.classList.remove('amoled-mode');
    }

    // Set CSS custom property for primary accent
    const accentHexMap = {
      blue: '#2563eb',
      emerald: '#059669',
      purple: '#7c3aed',
      amber: '#d97706',
      rose: '#e11d48',
      cyan: '#0891b2',
    };
    root.style.setProperty('--primary-accent', accentHexMap[settings.accentColor] || '#2563eb');
  }, [settings.theme, settings.accentColor]);

  // Sync document title to customized appName / shopName
  useEffect(() => {
    const title = settings.appName || settings.shopName || 'HIKMAT LEDGER PRO';
    document.title = `${title} — Shop & Personal Accounting`;
  }, [settings.appName, settings.shopName]);

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_TXS, JSON.stringify(archivedTransactions));
  }, [archivedTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TYPES, JSON.stringify(customTransactionTypes));
  }, [customTransactionTypes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(customFormFields));
  }, [customFormFields]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));
  }, [backups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCK_STATE, String(isAppLocked));
  }, [isAppLocked]);

  // Helper: Log audit trail
  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]); // maintain last 200 logs
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  // Helper map for transaction type accounting rules
  const typeRuleMap = useMemo(() => {
    const map = new Map<string, CustomTransactionType>();
    customTransactionTypes.forEach((t) => map.set(t.id, t));
    return map;
  }, [customTransactionTypes]);

  // Dynamic Customers balance enrichment
  const enrichedCustomers = useMemo(() => {
    return customers.map((cust) => {
      const custTxs = transactions.filter(
        (t) => !t.isArchived && (t.partyId === cust.id || (t.partyType === 'customer' && t.partyName === cust.name))
      );
      let credit = 0;
      let paid = 0;

      custTxs.forEach((t) => {
        if (t.type === 'customer_credit') {
          credit += t.amount;
        } else if (t.type === 'customer_payment') {
          paid += t.amount;
        }
      });

      const totalCredit = Math.max(cust.totalCreditGiven || 0, credit);
      const totalPaid = Math.max(cust.totalPaymentReceived || 0, paid);
      const balance = totalCredit - totalPaid;

      return {
        ...cust,
        totalCreditGiven: totalCredit,
        totalPaymentReceived: totalPaid,
        balance,
      };
    });
  }, [customers, transactions]);

  // Dynamic Suppliers balance enrichment
  const enrichedSuppliers = useMemo(() => {
    return suppliers.map((sup) => {
      const supTxs = transactions.filter(
        (t) => !t.isArchived && (t.partyId === sup.id || (t.partyType === 'supplier' && t.partyName === sup.name))
      );
      let purchases = 0;
      let paid = 0;

      supTxs.forEach((t) => {
        if (t.type === 'supplier_credit') {
          purchases += t.amount;
        } else if (t.type === 'supplier_payment') {
          paid += t.amount;
        }
      });

      const totalPurchases = Math.max(sup.totalPurchases || 0, purchases);
      const totalPaid = Math.max(sup.totalPaid || 0, paid);
      const balance = totalPurchases - totalPaid;

      return {
        ...sup,
        totalPurchases,
        totalPaid,
        balance,
      };
    });
  }, [suppliers, transactions]);

  // Dynamic Account balances calculation based on transaction types accounting rules
  const enrichedAccounts = useMemo(() => {
    return accounts.map((acc) => {
      let balance = acc.initialBalance || 0;

      transactions.forEach((tx) => {
        if (tx.isArchived) return;
        const amt = Number(tx.amount) || 0;

        // Transfers
        if (tx.type === 'transfer') {
          if (tx.accountId === acc.id) balance -= amt;
          if (tx.toAccountId === acc.id) balance += amt;
          return;
        }

        // Custom Transaction Type accounting rules lookup
        const rule = typeRuleMap.get(tx.type);

        if (tx.accountId === acc.id) {
          if (rule) {
            if (rule.cashFlow === 'inflow') {
              balance += amt;
            } else if (rule.cashFlow === 'outflow') {
              balance -= amt;
            }
          } else {
            // Fallback for standard types
            if (tx.type === 'income' || tx.type === 'customer_payment' || tx.type === 'owner_deposit') {
              balance += amt;
            } else if (tx.type === 'expense' || tx.type === 'supplier_payment' || tx.type === 'owner_withdrawal') {
              balance -= amt;
            }
          }
        }
      });

      return {
        ...acc,
        currentBalance: balance,
      };
    });
  }, [accounts, transactions, typeRuleMap]);

  // Dynamic Financial Summary Calculation
  const summary: FinancialSummary = useMemo(() => {
    let todayInc = 0;
    let todayExp = 0;
    let todayPersExp = 0;
    let monthInc = 0;
    let monthExp = 0;

    transactions.forEach((t) => {
      if (t.isArchived) return;
      const amt = Number(t.amount) || 0;
      const isTodayTx = isToday(t.date);
      const isMonthTx = isThisMonth(t.date);

      const rule = typeRuleMap.get(t.type);

      // Determine Profit & Loss Effect
      let isIncomePL = false;
      let isExpensePL = false;

      if (rule) {
        if (rule.plEffect === 'income') isIncomePL = true;
        if (rule.plEffect === 'expense') isExpensePL = true;
      } else {
        if (t.type === 'income' || t.type === 'customer_payment') isIncomePL = true;
        if (t.type === 'expense' || t.type === 'supplier_payment') isExpensePL = true;
      }

      if (isIncomePL) {
        if (isTodayTx) todayInc += amt;
        if (isMonthTx) monthInc += amt;
      }

      if (isExpensePL) {
        if (t.isBusiness) {
          if (isTodayTx) todayExp += amt;
          if (isMonthTx) monthExp += amt;
        } else {
          if (isTodayTx) todayPersExp += amt;
        }
      }
    });

    const todayProfit = todayInc - todayExp;
    const monthProfit = monthInc - monthExp;

    const totalReceivables = enrichedCustomers
      .filter((c) => !c.isArchived)
      .reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);

    const totalPayables = enrichedSuppliers
      .filter((s) => !s.isArchived)
      .reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0);

    let totalShopCash = 0;
    let totalPersonalCash = 0;
    let totalBank = 0;
    let totalWallet = 0;
    let totalCustomAccounts = 0;

    enrichedAccounts.forEach((acc) => {
      if (acc.isArchived || acc.isEnabled === false) return;
      if (acc.type === 'shop_cash') totalShopCash += acc.currentBalance;
      else if (acc.type === 'personal_cash') totalPersonalCash += acc.currentBalance;
      else if (acc.type === 'bank') totalBank += acc.currentBalance;
      else if (acc.type === 'wallet') totalWallet += acc.currentBalance;
      else totalCustomAccounts += acc.currentBalance;
    });

    const netWorth =
      totalShopCash +
      totalPersonalCash +
      totalBank +
      totalWallet +
      totalCustomAccounts +
      totalReceivables -
      totalPayables;

    return {
      todayIncome: todayInc,
      todayExpense: todayExp,
      todayProfit,
      todayPersonalExpense: todayPersExp,
      monthIncome: monthInc,
      monthExpense: monthExp,
      monthProfit,
      totalReceivables,
      totalPayables,
      totalShopCash,
      totalPersonalCash,
      totalBank,
      totalWallet,
      totalCustomAccounts,
      netWorth,
    };
  }, [transactions, enrichedCustomers, enrichedSuppliers, enrichedAccounts, typeRuleMap]);

  // Security Lock
  const unlockApp = (pin: string) => {
    if (!settings.pinEnabled || pin === settings.pinCode) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (settings.pinEnabled) {
      setIsAppLocked(true);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      addAuditLog({
        action: 'update',
        entity: 'settings',
        details: 'System preferences & appearance configuration updated',
      });
      return merged;
    });
  };

  const toggleTheme = () => {
    setSettings((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : prev.theme === 'light' ? 'amoled' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  const generateVoucherNo = () => {
    const year = new Date().getFullYear();
    const count = transactions.length + archivedTransactions.length + 1;
    return `HLP-${year}-${String(count).padStart(3, '0')}`;
  };

  // Transaction CRUD
  const addTransaction = (txData: Omit<Transaction, 'id' | 'voucherNo' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      voucherNo: generateVoucherNo(),
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    addAuditLog({
      action: 'create',
      entity: 'transaction',
      amount: newTx.amount,
      accountName: accounts.find((a) => a.id === newTx.accountId)?.name,
      details: `Created ${newTx.voucherNo}: ${newTx.type} of ${newTx.amount} PKR (${newTx.description})`,
    });

    return newTx;
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          addAuditLog({
            action: 'update',
            entity: 'transaction',
            amount: updatedFields.amount ?? tx.amount,
            details: `Updated ${tx.voucherNo} details`,
          });
          return { ...tx, ...updatedFields, updatedAt: Date.now() };
        }
        return tx;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (target) {
      addAuditLog({
        action: 'delete',
        entity: 'transaction',
        amount: target.amount,
        details: `Deleted ${target.voucherNo} (${target.type} of ${target.amount} PKR)`,
      });
    }
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const deleteSelectedTransactions = (ids: string[]) => {
    const count = ids.length;
    // Auto-create snapshot safety backup before bulk deletion
    createManualBackup(`Auto-Backup before deleting ${count} records`);
    setTransactions((prev) => prev.filter((tx) => !ids.includes(tx.id)));
    addAuditLog({
      action: 'delete',
      entity: 'transaction',
      details: `Bulk deleted ${count} selected transaction records (safety snapshot saved)`,
    });
  };

  const getTransactionById = (id: string) => {
    return transactions.find((t) => t.id === id) || archivedTransactions.find((t) => t.id === id);
  };

  const archiveTransactionsBeforeDate = (beforeDateIso: string): number => {
    const cutoff = new Date(beforeDateIso).getTime();
    const toArchive = transactions.filter((t) => new Date(t.date).getTime() < cutoff);
    const toKeep = transactions.filter((t) => new Date(t.date).getTime() >= cutoff);

    if (toArchive.length > 0) {
      setTransactions(toKeep);
      setArchivedTransactions((prev) => [...toArchive, ...prev]);
      addAuditLog({
        action: 'archive',
        entity: 'transaction',
        details: `Archived ${toArchive.length} historical transactions prior to ${beforeDateIso}`,
      });
    }
    return toArchive.length;
  };

  const recoverArchivedTransactions = (ids?: string[]) => {
    if (!ids || ids.length === 0) {
      // Recover all
      const count = archivedTransactions.length;
      setTransactions((prev) => [...archivedTransactions, ...prev]);
      setArchivedTransactions([]);
      addAuditLog({
        action: 'unarchive',
        entity: 'transaction',
        details: `Recovered all ${count} archived transactions back to active ledger`,
      });
    } else {
      const recovered = archivedTransactions.filter((t) => ids.includes(t.id));
      const remaining = archivedTransactions.filter((t) => !ids.includes(t.id));
      setTransactions((prev) => [...recovered, ...prev]);
      setArchivedTransactions(remaining);
      addAuditLog({
        action: 'unarchive',
        entity: 'transaction',
        details: `Recovered ${recovered.length} selected archived transactions`,
      });
    }
  };

  const exportFilteredTransactions = (criteria: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    categoryId?: string;
    type?: string;
  }): Transaction[] => {
    return transactions.filter((t) => {
      if (criteria.startDate && t.date < criteria.startDate) return false;
      if (criteria.endDate && t.date > criteria.endDate) return false;
      if (criteria.accountId && t.accountId !== criteria.accountId && t.toAccountId !== criteria.accountId) return false;
      if (criteria.categoryId && t.categoryId !== criteria.categoryId && t.category !== criteria.categoryId) return false;
      if (criteria.type && t.type !== criteria.type) return false;
      return true;
    });
  };

  // Customers CRUD & Safe Archival
  const addCustomer = (custData: Omit<Customer, 'id' | 'totalCreditGiven' | 'totalPaymentReceived' | 'balance' | 'createdAt'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust_${Date.now()}`,
      totalCreditGiven: 0,
      totalPaymentReceived: 0,
      balance: 0,
      isArchived: false,
      createdAt: Date.now(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    addAuditLog({
      action: 'create',
      entity: 'customer',
      details: `Added new customer: ${newCust.name} (${newCust.phone})`,
    });
    return newCust;
  };

  const updateCustomer = (id: string, updatedFields: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    addAuditLog({
      action: 'update',
      entity: 'customer',
      details: `Updated customer profile: ${updatedFields.name || id}`,
    });
  };

  const deleteCustomer = (id: string): { success: boolean; archived: boolean } => {
    const cust = customers.find((c) => c.id === id);
    if (!cust) return { success: false, archived: false };

    // Check if customer has transaction history
    const hasHistory = transactions.some((t) => t.partyId === id || (t.partyType === 'customer' && t.partyName === cust.name));

    if (hasHistory) {
      // Safety rule: Archive customer instead of destroying transaction history!
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c))
      );
      addAuditLog({
        action: 'archive',
        entity: 'customer',
        details: `Customer "${cust.name}" archived to preserve financial transaction history`,
      });
      return { success: true, archived: true };
    } else {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      addAuditLog({
        action: 'delete',
        entity: 'customer',
        details: `Permanently removed customer "${cust.name}" (no financial records existed)`,
      });
      return { success: true, archived: false };
    }
  };

  const unarchiveCustomer = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: false } : c))
    );
    addAuditLog({
      action: 'unarchive',
      entity: 'customer',
      details: `Restored customer from archive`,
    });
  };

  const getCustomerById = (id: string) => {
    return enrichedCustomers.find((c) => c.id === id);
  };

  // Suppliers CRUD & Safe Archival
  const addSupplier = (supData: Omit<Supplier, 'id' | 'totalPurchases' | 'totalPaid' | 'balance' | 'createdAt'>) => {
    const newSup: Supplier = {
      ...supData,
      id: `sup_${Date.now()}`,
      totalPurchases: 0,
      totalPaid: 0,
      balance: 0,
      isArchived: false,
      createdAt: Date.now(),
    };
    setSuppliers((prev) => [newSup, ...prev]);
    addAuditLog({
      action: 'create',
      entity: 'supplier',
      details: `Added new supplier: ${newSup.name}`,
    });
    return newSup;
  };

  const updateSupplier = (id: string, updatedFields: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    addAuditLog({
      action: 'update',
      entity: 'supplier',
      details: `Updated supplier details: ${updatedFields.name || id}`,
    });
  };

  const deleteSupplier = (id: string): { success: boolean; archived: boolean } => {
    const sup = suppliers.find((s) => s.id === id);
    if (!sup) return { success: false, archived: false };

    const hasHistory = transactions.some((t) => t.partyId === id || (t.partyType === 'supplier' && t.partyName === sup.name));

    if (hasHistory) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isArchived: true } : s))
      );
      addAuditLog({
        action: 'archive',
        entity: 'supplier',
        details: `Supplier "${sup.name}" archived to preserve historical purchases & vouchers`,
      });
      return { success: true, archived: true };
    } else {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      addAuditLog({
        action: 'delete',
        entity: 'supplier',
        details: `Permanently removed supplier "${sup.name}" (no transactions existed)`,
      });
      return { success: true, archived: false };
    }
  };

  const unarchiveSupplier = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isArchived: false } : s))
    );
    addAuditLog({
      action: 'unarchive',
      entity: 'supplier',
      details: `Restored supplier from archive`,
    });
  };

  const getSupplierById = (id: string) => {
    return enrichedSuppliers.find((s) => s.id === id);
  };

  // Accounts CRUD & Cash Management
  const addAccount = (accData: Omit<Account, 'id' | 'currentBalance'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      currentBalance: accData.initialBalance,
      isEnabled: true,
      isArchived: false,
      createdAt: Date.now(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    addAuditLog({
      action: 'create',
      entity: 'account',
      accountName: newAcc.name,
      amount: newAcc.initialBalance,
      details: `Added new financial account "${newAcc.name}" with opening balance ${newAcc.initialBalance} PKR`,
    });
    return newAcc;
  };

  const updateAccount = (id: string, updatedFields: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    addAuditLog({
      action: 'update',
      entity: 'account',
      details: `Updated account settings for ${updatedFields.name || id}`,
    });
  };

  const deleteAccount = (id: string): { success: boolean; archived: boolean } => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return { success: false, archived: false };

    const hasHistory = transactions.some((t) => t.accountId === id || t.toAccountId === id);

    if (hasHistory) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isArchived: true, isEnabled: false } : a))
      );
      addAuditLog({
        action: 'archive',
        entity: 'account',
        accountName: acc.name,
        details: `Account "${acc.name}" archived to preserve balance & transaction audit trail`,
      });
      return { success: true, archived: true };
    } else {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      addAuditLog({
        action: 'delete',
        entity: 'account',
        accountName: acc.name,
        details: `Permanently removed empty account "${acc.name}"`,
      });
      return { success: true, archived: false };
    }
  };

  const unarchiveAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isArchived: false, isEnabled: true } : a))
    );
    addAuditLog({
      action: 'unarchive',
      entity: 'account',
      details: `Restored account from archive`,
    });
  };

  const toggleAccountStatus = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  // Cash Management (Cash In / Cash Out / Adjustments)
  const adjustCash = ({
    accountId,
    amount,
    actionType,
    reason,
    date,
    notes,
  }: {
    accountId: string;
    amount: number;
    actionType: 'add_cash' | 'remove_cash' | 'reconciliation';
    reason: string;
    date: string;
    notes?: string;
  }): Transaction => {
    const acc = accounts.find((a) => a.id === accountId);
    const absAmt = Math.abs(amount);

    const isAdd = actionType === 'add_cash';
    const txType: TransactionType = 'cash_adjustment';

    const txDesc = isAdd
      ? `Cash In / Added: ${reason}`
      : `Cash Out / Withdrawn: ${reason}`;

    const createdTx = addTransaction({
      date,
      type: txType,
      amount: absAmt,
      category: 'Cash Adjustment',
      isBusiness: true,
      accountId,
      paymentMethod: 'Cash (Naqd)',
      description: txDesc,
      notes: notes || `Manual cash adjustment on ${acc?.name || 'Account'}. Reason: ${reason}`,
    });

    addAuditLog({
      action: 'cash_adjustment',
      entity: 'account',
      accountName: acc?.name,
      amount: absAmt,
      details: `Audited cash adjustment (${isAdd ? '+Inflow' : '-Outflow'}) of ${absAmt} PKR on ${acc?.name}: ${reason}`,
    });

    return createdTx;
  };

  const transferFunds = ({
    fromAccountId,
    toAccountId,
    amount,
    description,
    date,
    paymentMethod,
  }: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description: string;
    date: string;
    paymentMethod?: string;
  }) => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    const txDesc = description || `Transfer: ${fromAcc?.name || 'Account'} ➔ ${toAcc?.name || 'Account'}`;

    addTransaction({
      date,
      type: 'transfer',
      amount,
      category: 'Account Transfer',
      isBusiness: true,
      accountId: fromAccountId,
      toAccountId,
      paymentMethod: paymentMethod || 'Bank Transfer (Meezan/HBL)',
      description: txDesc,
      notes: `Funds transferred from ${fromAcc?.name} to ${toAcc?.name}`,
    });

    addAuditLog({
      action: 'transfer',
      entity: 'account',
      amount,
      details: `Transferred ${amount} PKR from ${fromAcc?.name} to ${toAcc?.name}`,
    });
  };

  // Categories CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      isEnabled: true,
      isArchived: false,
      orderIndex: categories.length + 1,
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog({
      action: 'create',
      entity: 'category',
      details: `Added new category: ${newCat.name} (${newCat.type})`,
    });
    return newCat;
  };

  const updateCategory = (id: string, catData: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...catData } : c))
    );
    addAuditLog({
      action: 'update',
      entity: 'category',
      details: `Updated category "${catData.name || id}"`,
    });
  };

  const deleteCategory = (id: string): { success: boolean; archived: boolean } => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return { success: false, archived: false };

    const isUsed = transactions.some((t) => t.category === cat.name || t.categoryId === id);

    if (isUsed) {
      // Safety rule: Archive category so historical transactions are preserved!
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isArchived: true, isEnabled: false } : c))
      );
      addAuditLog({
        action: 'archive',
        entity: 'category',
        details: `Category "${cat.name}" archived to preserve historical reports and transaction labels`,
      });
      return { success: true, archived: true };
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      addAuditLog({
        action: 'delete',
        entity: 'category',
        details: `Permanently deleted unused category "${cat.name}"`,
      });
      return { success: true, archived: false };
    }
  };

  const unarchiveCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: false, isEnabled: true } : c))
    );
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isEnabled: !c.isEnabled } : c))
    );
  };

  const reorderCategories = (newOrder: Category[]) => {
    setCategories(newOrder);
  };

  // Custom Transaction Types
  const addCustomTransactionType = (t: Omit<CustomTransactionType, 'id'>) => {
    const newType: CustomTransactionType = {
      ...t,
      id: `type_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      isEnabled: true,
      isSystem: false,
    };
    setCustomTransactionTypes((prev) => [...prev, newType]);
    addAuditLog({
      action: 'create',
      entity: 'custom_type',
      details: `Created custom transaction type: ${newType.name}`,
    });
    return newType;
  };

  const updateCustomTransactionType = (id: string, t: Partial<CustomTransactionType>) => {
    setCustomTransactionTypes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...t } : item))
    );
    addAuditLog({
      action: 'update',
      entity: 'custom_type',
      details: `Updated custom transaction type: ${t.name || id}`,
    });
  };

  const deleteCustomTransactionType = (id: string) => {
    setCustomTransactionTypes((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCustomTransactionType = (id: string) => {
    setCustomTransactionTypes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEnabled: !item.isEnabled } : item))
    );
  };

  // Payment Methods
  const addPaymentMethod = (pm: Omit<PaymentMethod, 'id'>) => {
    const newPm: PaymentMethod = {
      ...pm,
      id: `pm_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      isEnabled: true,
      orderIndex: paymentMethods.length + 1,
    };
    setPaymentMethods((prev) => [...prev, newPm]);
    return newPm;
  };

  const updatePaymentMethod = (id: string, pm: Partial<PaymentMethod>) => {
    setPaymentMethods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...pm } : item))
    );
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((item) => item.id !== id));
  };

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEnabled: !item.isEnabled } : item))
    );
  };

  const reorderPaymentMethods = (newOrder: PaymentMethod[]) => {
    setPaymentMethods(newOrder);
  };

  // Custom Form Fields
  const addCustomFormField = (field: Omit<CustomFormField, 'id'>) => {
    const newField: CustomFormField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      isEnabled: true,
    };
    setCustomFormFields((prev) => [...prev, newField]);
    return newField;
  };

  const updateCustomFormField = (id: string, field: Partial<CustomFormField>) => {
    setCustomFormFields((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...field } : item))
    );
  };

  const deleteCustomFormField = (id: string) => {
    setCustomFormFields((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCustomFormField = (id: string) => {
    setCustomFormFields((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEnabled: !item.isEnabled } : item))
    );
  };

  // Dashboard Settings
  const updateDashboardSettings = (newSettings: Partial<DashboardSettings>) => {
    setSettings((prev) => ({
      ...prev,
      dashboard: { ...prev.dashboard, ...newSettings },
    }));
  };

  const reorderDashboardCards = (cards: DashboardCardConfig[]) => {
    updateDashboardSettings({ cards });
  };

  const toggleDashboardCard = (cardId: string) => {
    setSettings((prev) => {
      const cards = prev.dashboard.cards.map((c) =>
        c.id === cardId ? { ...c, isEnabled: !c.isEnabled } : c
      );
      return { ...prev, dashboard: { ...prev.dashboard, cards } };
    });
  };

  // Backup & Restore
  const exportDatabaseJSON = () => {
    const dbDump = {
      version: '2.0',
      appName: settings.appName,
      shopName: settings.shopName,
      developer: settings.developerName,
      exportedAt: new Date().toISOString(),
      accounts,
      transactions,
      archivedTransactions,
      customers,
      suppliers,
      categories,
      customTransactionTypes,
      paymentMethods,
      customFormFields,
      settings,
      auditLogs,
    };
    return JSON.stringify(dbDump, null, 2);
  };

  const createManualBackup = (label = 'Manual Snapshot') => {
    const json = exportDatabaseJSON();
    const newBackup: BackupSnapshot = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      label,
      transactionCount: transactions.length,
      data: json,
    };
    setBackups((prev) => [newBackup, ...prev.slice(0, 19)]); // store latest 20
    addAuditLog({
      action: 'create',
      entity: 'settings',
      details: `Saved backup snapshot: "${label}"`,
    });
  };

  const restoreFromJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.transactions || !Array.isArray(data.transactions)) {
        return { success: false, error: 'Invalid backup file: transactions array missing.' };
      }

      if (data.accounts) setAccounts(data.accounts);
      if (data.transactions) setTransactions(data.transactions);
      if (data.archivedTransactions) setArchivedTransactions(data.archivedTransactions);
      if (data.customers) setCustomers(data.customers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.categories) setCategories(data.categories);
      if (data.customTransactionTypes) setCustomTransactionTypes(data.customTransactionTypes);
      if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
      if (data.customFormFields) setCustomFormFields(data.customFormFields);
      if (data.settings) setSettings(data.settings);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      addAuditLog({
        action: 'restore',
        entity: 'settings',
        details: `Restored database backup (version ${data.version || '1.0'}) successfully`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to parse JSON file' };
    }
  };

  const resetDatabase = () => {
    createManualBackup('Pre-Reset Emergency Snapshot');
    setTransactions([]);
    setArchivedTransactions([]);
    setCustomers([]);
    setSuppliers([]);
    setAccounts(DEFAULT_ACCOUNTS.map((a) => ({ ...a, initialBalance: 0, currentBalance: 0 })));
    setCategories(DEFAULT_CATEGORIES);
    setAuditLogs([]);
    addAuditLog({
      action: 'delete',
      entity: 'settings',
      details: 'Database completely reset to clean state',
    });
  };

  const loadSampleData = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    setTransactions(DEFAULT_TRANSACTIONS);
    setArchivedTransactions([]);
    setCustomers(DEFAULT_CUSTOMERS);
    setSuppliers(DEFAULT_SUPPLIERS);
    setCategories(DEFAULT_CATEGORIES);
    setCustomTransactionTypes(DEFAULT_TRANSACTION_TYPES);
    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    setCustomFormFields(DEFAULT_CUSTOM_FORM_FIELDS);
    setSettings(DEFAULT_SETTINGS);
    addAuditLog({
      action: 'create',
      entity: 'settings',
      details: 'Loaded standard mobile software & electronics shop demo dataset',
    });
  };

  return (
    <LedgerContext.Provider
      value={{
        accounts: enrichedAccounts,
        transactions,
        archivedTransactions,
        customers: enrichedCustomers,
        suppliers: enrichedSuppliers,
        categories,
        customTransactionTypes,
        paymentMethods,
        customFormFields,
        auditLogs,
        settings,
        summary,
        isAppLocked,
        backups,
        unlockApp,
        lockApp,
        updateSettings,
        toggleTheme,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        deleteSelectedTransactions,
        getTransactionById,
        archiveTransactionsBeforeDate,
        recoverArchivedTransactions,
        exportFilteredTransactions,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        unarchiveCustomer,
        getCustomerById,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        unarchiveSupplier,
        getSupplierById,
        addAccount,
        updateAccount,
        deleteAccount,
        unarchiveAccount,
        toggleAccountStatus,
        adjustCash,
        transferFunds,
        addCategory,
        updateCategory,
        deleteCategory,
        unarchiveCategory,
        toggleCategoryStatus,
        reorderCategories,
        addCustomTransactionType,
        updateCustomTransactionType,
        deleteCustomTransactionType,
        toggleCustomTransactionType,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        togglePaymentMethod,
        reorderPaymentMethods,
        addCustomFormField,
        updateCustomFormField,
        deleteCustomFormField,
        toggleCustomFormField,
        updateDashboardSettings,
        reorderDashboardCards,
        toggleDashboardCard,
        addAuditLog,
        clearAuditLogs,
        createManualBackup,
        restoreFromJSON,
        exportDatabaseJSON,
        resetDatabase,
        loadSampleData,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};
