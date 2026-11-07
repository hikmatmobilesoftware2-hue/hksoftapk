export type AccountType = 'shop_cash' | 'personal_cash' | 'bank' | 'wallet' | 'custom' | string;

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  accountNumber?: string;
  bankName?: string;
  initialBalance: number;
  currentBalance: number;
  isDefault?: boolean;
  isEnabled?: boolean;
  isArchived?: boolean;
  color?: string;
  icon?: string;
  notes?: string;
  createdAt?: number;
}

export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'customer_credit' // Udhaar given to customer
  | 'customer_payment' // Wasooli from customer
  | 'supplier_credit' // Purchase from supplier on credit
  | 'supplier_payment' // Payment made to supplier
  | 'owner_withdrawal' // Personal withdrawal (drawings)
  | 'owner_deposit' // Capital added
  | 'cash_adjustment' // Manual cash in / cash out / reconciliation
  | string;

export interface CustomTransactionType {
  id: string;
  name: string;
  urduLabel?: string;
  cashFlow: 'inflow' | 'outflow' | 'transfer' | 'none';
  plEffect: 'income' | 'expense' | 'neutral';
  scope: 'business' | 'personal' | 'transfer' | 'party';
  color: string;
  icon?: string;
  isEnabled: boolean;
  isSystem?: boolean;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  urduName?: string;
  icon?: string;
  color?: string;
  isEnabled: boolean;
  orderIndex: number;
  isDefault?: boolean;
}

export interface CustomFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date';
  options?: string[]; // for select type
  applicableTo: 'all' | 'income' | 'expense';
  required: boolean;
  isEnabled: boolean;
  showInReceipt?: boolean;
  placeholder?: string;
}

export interface DashboardCardConfig {
  id: string;
  title: string;
  urduTitle?: string;
  metricKey: string;
  category: 'shop' | 'personal' | 'banking' | 'khata';
  isEnabled: boolean;
  orderIndex: number;
  color?: string;
  icon?: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete' | 'archive' | 'unarchive' | 'cash_adjustment' | 'transfer' | 'restore';
  entity: 'transaction' | 'account' | 'category' | 'customer' | 'supplier' | 'custom_type' | 'settings';
  details: string;
  amount?: number;
  accountName?: string;
}

export interface Transaction {
  id: string;
  voucherNo: string;
  date: string; // ISO date string: YYYY-MM-DDTHH:mm
  type: TransactionType;
  customTypeId?: string;
  amount: number;
  category: string;
  categoryId?: string;
  isBusiness: boolean; // false for personal expenses & owner drawings
  accountId: string; // Source account (e.g. shop_cash, bank)
  toAccountId?: string; // Destination account for transfers
  partyId?: string; // customerId or supplierId
  partyType?: 'customer' | 'supplier';
  partyName?: string;
  paymentMethod?: string;
  referenceNo?: string;
  description: string;
  notes?: string;
  receiptImage?: string; // Base64 data URL
  customFieldValues?: Record<string, string | number>;
  isArchived?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  cnic?: string;
  creditLimit?: number;
  totalCreditGiven: number; // Udhaar
  totalPaymentReceived: number; // Wasooli
  balance: number; // credit - payment (positive = customer owes us)
  notes?: string;
  isArchived?: boolean;
  customFieldValues?: Record<string, string | number>;
  createdAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  companyName?: string;
  address?: string;
  totalPurchases: number; // Kharidari
  totalPaid: number; // Adaigi
  balance: number; // purchases - paid (positive = we owe supplier)
  notes?: string;
  isArchived?: boolean;
  customFieldValues?: Record<string, string | number>;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  urduName?: string;
  type: 'income' | 'expense';
  isBusiness: boolean;
  icon?: string;
  color?: string;
  isEnabled: boolean;
  orderIndex?: number;
  isArchived?: boolean;
  isDefault?: boolean;
}

export interface CurrencyConfig {
  code: string; // PKR, USD, AED, SAR, EUR, etc.
  symbol: string; // Rs., ₨, $, د.إ, etc.
  position: 'prefix' | 'suffix';
}

export interface FormFieldsVisibility {
  showReferenceNo: boolean;
  showNotes: boolean;
  showReceiptImage: boolean;
  showPaymentMethod: boolean;
  showPartyLink: boolean;
  showQuickAmounts: boolean;
}

export interface DashboardSettings {
  layoutMode: 'grid_4' | 'grid_3' | 'compact';
  showShopStats: boolean;
  showPersonalStats: boolean;
  cards: DashboardCardConfig[];
}

export interface AppSettings {
  appName: string; // Dynamic App display name
  shopName: string;
  tagline: string;
  ownerName: string;
  developerName: string;
  phone: string;
  address: string;
  logoUrl?: string;
  currency: CurrencyConfig;
  dateFormat: 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  numberFormat: 'lakh_crore' | 'international';
  theme: 'dark' | 'light' | 'amoled';
  accentColor: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan';
  language: 'en' | 'ur_roman' | 'bilingual';
  pinEnabled: boolean;
  pinCode: string;
  autoBackup: boolean;
  lastBackupDate?: string;
  formFieldsVisibility: FormFieldsVisibility;
  dashboard: DashboardSettings;
}

export interface FinancialSummary {
  todayIncome: number;
  todayExpense: number;
  todayProfit: number;
  todayPersonalExpense: number;
  monthIncome: number;
  monthExpense: number;
  monthProfit: number;
  totalReceivables: number;
  totalPayables: number;
  totalShopCash: number;
  totalPersonalCash: number;
  totalBank: number;
  totalWallet: number;
  totalCustomAccounts: number;
  netWorth: number;
}
