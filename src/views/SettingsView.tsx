import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Store,
  Lock,
  Sun,
  Moon,
  Save,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Info,
  CreditCard,
  Sliders,
  FormInput,
  Palette,
  Globe,
  DollarSign,
  Calendar,
  History,
  Trash2,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatPakDateTime, formatPKR } from '../utils/formatters';
import { CustomTransactionTypeModal } from '../components/modals/CustomTransactionTypeModal';
import { PaymentMethodModal } from '../components/modals/PaymentMethodModal';
import { CustomFormFieldModal } from '../components/modals/CustomFormFieldModal';
import { CustomFormField, CustomTransactionType, PaymentMethod } from '../types';

interface SettingsViewProps {
  onOpenInstallModal?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenInstallModal, onNavigateTab }) => {
  const {
    settings,
    updateSettings,
    toggleTheme,
    lockApp,
    customTransactionTypes,
    toggleCustomTransactionType,
    deleteCustomTransactionType,
    paymentMethods,
    togglePaymentMethod,
    deletePaymentMethod,
    customFormFields,
    toggleCustomFormField,
    deleteCustomFormField,
    auditLogs,
    clearAuditLogs,
    categories,
    accounts,
  } = useLedger();

  const [activeSubTab, setActiveSubTab] = useState<
    'branding' | 'appearance' | 'currency' | 'form_fields' | 'tx_types' | 'payment_methods' | 'security' | 'audit'
  >('branding');

  // Form State
  const [appName, setAppName] = useState(settings.appName || 'HIKMAT LEDGER PRO');
  const [shopName, setShopName] = useState(settings.shopName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');

  // Theme & Appearance
  const [theme, setTheme] = useState<'dark' | 'light' | 'amoled'>(settings.theme || 'dark');
  const [accentColor, setAccentColor] = useState(settings.accentColor || 'blue');
  const [language, setLanguage] = useState(settings.language || 'en');

  // Currency & Formats
  const [currCode, setCurrCode] = useState(settings.currency.code || 'PKR');
  const [currSymbol, setCurrSymbol] = useState(settings.currency.symbol || 'Rs.');
  const [currPosition, setCurrPosition] = useState<'prefix' | 'suffix'>(settings.currency.position || 'prefix');
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'DD-MM-YYYY');
  const [numberFormat, setNumberFormat] = useState(settings.numberFormat || 'lakh_crore');

  // Form Fields Toggles
  const [formFieldsVisibility, setFormFieldsVisibility] = useState(settings.formFieldsVisibility);

  // Security PIN
  const [pinEnabled, setPinEnabled] = useState(settings.pinEnabled);
  const [pinCode, setPinCode] = useState(settings.pinCode);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modals
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<CustomTransactionType | null>(null);

  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

  const [isFormFieldModalOpen, setIsFormFieldModalOpen] = useState(false);
  const [editingFormField, setEditingFormField] = useState<CustomFormField | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinEnabled && (!pinCode || pinCode.length < 4)) {
      alert('Security PIN must be at least 4 digits');
      return;
    }

    updateSettings({
      appName: appName.trim() || 'HIKMAT LEDGER PRO',
      shopName: shopName.trim() || 'HIKMAT LEDGER PRO',
      tagline: tagline.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      logoUrl: logoUrl || undefined,
      theme,
      accentColor,
      language,
      currency: {
        code: currCode.trim() || 'PKR',
        symbol: currSymbol.trim() || 'Rs.',
        position: currPosition,
      },
      dateFormat,
      numberFormat,
      formFieldsVisibility,
      pinEnabled,
      pinCode,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const subTabs = [
    { id: 'branding', label: 'Shop & Branding', icon: Store },
    { id: 'appearance', label: 'Theme & Accent', icon: Palette },
    { id: 'currency', label: 'Currency & Formats', icon: DollarSign },
    { id: 'form_fields', label: 'Custom Form Fields', icon: FormInput },
    { id: 'tx_types', label: 'Transaction Types', icon: Sliders },
    { id: 'payment_methods', label: 'Payment Methods', icon: CreditCard },
    { id: 'security', label: 'Security PIN', icon: Shield },
    { id: 'audit', label: 'Audit Trail Logs', icon: History },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System Control & Dynamic Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            100% owner-controlled architecture — customize branding, fields, types, and security
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Configuration Saved!</span>
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Body */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* TAB 1: Shop & Branding */}
        {activeSubTab === 'branding' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Shop Branding & App Identity</h3>
                <p className="text-[11px] text-slate-400">
                  Controls the application header title, printed invoices, and WhatsApp vouchers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Application Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. HIKMAT LEDGER PRO"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business / Store Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. HIKMAT MOBILE SOFTWARE"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tagline / Business Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Shop & Personal Finance Management System"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Proprietor / Owner Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Hikmat Khan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Official Phone / WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Shop Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop #12, Mobile Plaza, Pakistan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
                />
              </div>

              {/* Logo Upload */}
              <div className="sm:col-span-2 pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business Logo / Custom Icon
                </label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Business Logo"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      HLP
                    </div>
                  )}
                  <div>
                    <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white rounded-xl cursor-pointer inline-block transition-colors">
                      Upload Logo Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="ml-2 text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Reset to Default Icon
                      </button>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, or SVG up to 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Appearance & Theme */}
        {activeSubTab === 'appearance' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Theme & Color Palette</h3>
              <p className="text-[11px] text-slate-400">Personalize display style and accent highlights</p>
            </div>

            {/* Theme Mode: Dark / Light / AMOLED */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Application Visual Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Moon className="w-5 h-5 text-blue-400 mb-2" />
                  <span className="text-xs font-bold text-white block">Slate Dark</span>
                  <span className="text-[10px] text-slate-400">Eye-friendly dark blue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('amoled')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    theme === 'amoled'
                      ? 'bg-black border-blue-500 ring-2 ring-blue-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-black border border-slate-700 mb-2" />
                  <span className="text-xs font-bold text-white block">AMOLED Black</span>
                  <span className="text-[10px] text-slate-400">Pitch black for OLED screens</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'bg-slate-100 border-blue-500 ring-2 ring-blue-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500 mb-2" />
                  <span className="text-xs font-bold text-white block">Day Light</span>
                  <span className="text-[10px] text-slate-400">Clean white presentation</span>
                </button>
              </div>
            </div>

            {/* Accent Color Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Primary Accent Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                {[
                  { id: 'blue', label: 'Classic Blue', hex: '#2563eb' },
                  { id: 'emerald', label: 'Emerald Green', hex: '#059669' },
                  { id: 'purple', label: 'Royal Purple', hex: '#7c3aed' },
                  { id: 'amber', label: 'Amber Gold', hex: '#d97706' },
                  { id: 'rose', label: 'Rose Red', hex: '#e11d48' },
                  { id: 'cyan', label: 'Cyan Teal', hex: '#0891b2' },
                ].map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setAccentColor(col.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      accentColor === col.id
                        ? 'bg-slate-800 border-white ring-1 ring-white/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full mx-auto mb-1.5"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-[11px] font-semibold text-slate-200 block truncate">
                      {col.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Interface Language Convention
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg cursor-pointer ${
                    language === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ur_roman')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg cursor-pointer ${
                    language === 'ur_roman' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Roman Urdu (Aamdani/Kharch)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bilingual')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg cursor-pointer ${
                    language === 'bilingual' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bilingual English + اردو
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Currency & Regional Formats */}
        {activeSubTab === 'currency' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Currency & Number Formatting</h3>
                <p className="text-[11px] text-slate-400">
                  Configure custom currency symbols, separator style, and date displays
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  required
                  value={currSymbol}
                  onChange={(e) => setCurrSymbol(e.target.value)}
                  placeholder="Rs. or ₨ or $ or AED"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Currency Code
                </label>
                <input
                  type="text"
                  required
                  value={currCode}
                  onChange={(e) => setCurrCode(e.target.value.toUpperCase())}
                  placeholder="PKR, USD, AED, SAR..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Symbol Position
                </label>
                <select
                  value={currPosition}
                  onChange={(e) => setCurrPosition(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
                >
                  <option value="prefix">Prefix (Rs. 10,000)</option>
                  <option value="suffix">Suffix (10,000 Rs.)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Number Format (Grouping)
                </label>
                <select
                  value={numberFormat}
                  onChange={(e) => setNumberFormat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
                >
                  <option value="lakh_crore">Pakistani Lakh / Crore (1,00,000)</option>
                  <option value="international">Standard International (100,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
                >
                  <option value="DD-MM-YYYY">DD-MM-YYYY (Pakistan Standard)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Live Preview</span>
                <span className="text-base font-bold font-mono text-emerald-400 mt-1">
                  {formatPKR(150000, true, { code: currCode, symbol: currSymbol, position: currPosition }, numberFormat)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Custom Form Fields */}
        {activeSubTab === 'form_fields' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Dynamic Form Fields Configuration</h3>
                <p className="text-[11px] text-slate-400">
                  Control which optional fields appear on income & expense vouchers, plus add custom fields
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingFormField(null);
                  setIsFormFieldModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Custom Field</span>
              </button>
            </div>

            {/* Optional Core Fields Visibility Toggles */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 block mb-2">
                Standard Form Elements (Show / Hide)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Reference / Tracking Number</span>
                  <input
                    type="checkbox"
                    checked={formFieldsVisibility.showReferenceNo}
                    onChange={(e) =>
                      setFormFieldsVisibility({
                        ...formFieldsVisibility,
                        showReferenceNo: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Payment Method Selector</span>
                  <input
                    type="checkbox"
                    checked={formFieldsVisibility.showPaymentMethod}
                    onChange={(e) =>
                      setFormFieldsVisibility({
                        ...formFieldsVisibility,
                        showPaymentMethod: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Customer & Supplier Party Link</span>
                  <input
                    type="checkbox"
                    checked={formFieldsVisibility.showPartyLink}
                    onChange={(e) =>
                      setFormFieldsVisibility({
                        ...formFieldsVisibility,
                        showPartyLink: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Bill & Receipt Slip Photo Upload</span>
                  <input
                    type="checkbox"
                    checked={formFieldsVisibility.showReceiptImage}
                    onChange={(e) =>
                      setFormFieldsVisibility({
                        ...formFieldsVisibility,
                        showReceiptImage: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Detailed Voucher Notes</span>
                  <input
                    type="checkbox"
                    checked={formFieldsVisibility.showNotes}
                    onChange={(e) =>
                      setFormFieldsVisibility({
                        ...formFieldsVisibility,
                        showNotes: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Quick 1-Tap Rupee Additions (+500, +1000)</span>
                  <input
                    type="checkbox"
                    checked={formFieldsVisibility.showQuickAmounts}
                    onChange={(e) =>
                      setFormFieldsVisibility({
                        ...formFieldsVisibility,
                        showQuickAmounts: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                </label>
              </div>
            </div>

            {/* Custom User Form Fields List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-200 block">
                User-Defined Custom Form Fields ({customFormFields.length})
              </span>

              {customFormFields.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No custom fields created yet. Click "+ Add Custom Field" above.
                </p>
              ) : (
                <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden bg-slate-950">
                  {customFormFields.map((field) => (
                    <div
                      key={field.id}
                      className="p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{field.label}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 uppercase font-mono">
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 border border-rose-800 text-rose-300 font-semibold">
                              Required
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Applicable to: {field.applicableTo} forms
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleCustomFormField(field.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                            field.isEnabled
                              ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {field.isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFormField(field);
                            setIsFormFieldModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-900"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCustomFormField(field.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Custom Transaction Types */}
        {activeSubTab === 'tx_types' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Custom Transaction Types & Accounting Rules</h3>
                <p className="text-[11px] text-slate-400">
                  Control Cash Flow (inflow/outflow/none) and Profit & Loss operating impact
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingType(null);
                  setIsTypeModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Transaction Type</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden bg-slate-950">
              {customTransactionTypes.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{t.name}</span>
                      {t.urduLabel && <span className="text-slate-400">({t.urduLabel})</span>}
                      {t.isSystem && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                          System
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          t.cashFlow === 'inflow'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : t.cashFlow === 'outflow'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        Cash: {t.cashFlow}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        P&L: {t.plEffect}
                      </span>
                      <span className="text-[10px] text-slate-400">Scope: {t.scope}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleCustomTransactionType(t.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                        t.isEnabled
                          ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {t.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingType(t);
                        setIsTypeModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-900"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!t.isSystem && (
                      <button
                        type="button"
                        onClick={() => deleteCustomTransactionType(t.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Custom Payment Methods */}
        {activeSubTab === 'payment_methods' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Custom Payment Methods</h3>
                <p className="text-[11px] text-slate-400">
                  Manage Cash, Banks, Wallets, Raast QR, and Cheques
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPaymentMethod(null);
                  setIsPaymentMethodModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Payment Method</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden bg-slate-950">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-800"
                      style={{ backgroundColor: `${pm.color || '#3B82F6'}20` }}
                    >
                      <CreditCard className="w-4 h-4" style={{ color: pm.color || '#3B82F6' }} />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        {pm.name} {pm.urduName && <span className="text-slate-400 font-normal">({pm.urduName})</span>}
                      </span>
                      {pm.isDefault && (
                        <span className="text-[10px] text-blue-400 font-semibold">Default Method</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => togglePaymentMethod(pm.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                        pm.isEnabled
                          ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {pm.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPaymentMethod(pm);
                        setIsPaymentMethodModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-900"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePaymentMethod(pm.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: Security PIN */}
        {activeSubTab === 'security' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Application Security & PIN Lock</h3>
                <p className="text-[11px] text-slate-400">
                  Protect sensitive accounting records and profit margins from unauthorized access
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Enable Security PIN Lock</span>
                <span className="text-[11px] text-slate-400">
                  Requires entering your 4-digit PIN when opening or resuming the application
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinEnabled}
                  onChange={(e) => setPinEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {pinEnabled && (
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Set 4-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-base font-bold font-mono tracking-widest text-center text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4 sm:pt-0">
                  <button
                    type="button"
                    onClick={lockApp}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lock & Test Screen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: System Audit Trail Logs */}
        {activeSubTab === 'audit' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">System Activity & Financial Audit Trail</h3>
                <p className="text-[11px] text-slate-400">
                  Tamper-proof record of all manual cash adjustments, balance changes, and records
                </p>
              </div>
              {auditLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear audit logs history?')) clearAuditLogs();
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No activity logs recorded yet. All future adjustments and creations will appear here.
              </p>
            ) : (
              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800/80 overflow-hidden bg-slate-950 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 text-xs flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.action === 'cash_adjustment'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : log.action === 'create'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : log.action === 'delete'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-slate-200">{log.entity}</span>
                        {log.amount && (
                          <span className="font-mono text-emerald-400 font-bold">
                            {formatPKR(log.amount, true, settings.currency, settings.numberFormat)}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 whitespace-nowrap">
                      {formatPakDateTime(log.timestamp, settings.dateFormat)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>

      {/* Dynamic Sub-Modals */}
      {isTypeModalOpen && (
        <CustomTransactionTypeModal
          isOpen={isTypeModalOpen}
          onClose={() => setIsTypeModalOpen(false)}
          editingType={editingType}
        />
      )}

      {isPaymentMethodModalOpen && (
        <PaymentMethodModal
          isOpen={isPaymentMethodModalOpen}
          onClose={() => setIsPaymentMethodModalOpen(false)}
          editingMethod={editingPaymentMethod}
        />
      )}

      {isFormFieldModalOpen && (
        <CustomFormFieldModal
          isOpen={isFormFieldModalOpen}
          onClose={() => setIsFormFieldModalOpen(false)}
          editingField={editingFormField}
        />
      )}
    </div>
  );
};
