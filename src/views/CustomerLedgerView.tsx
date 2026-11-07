import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Search,
  Download,
  Share2,
  Plus,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Customer, Transaction } from '../types';
import { formatPakDate, formatPakDateTime, formatPKR } from '../utils/formatters';
import { exportCustomersToCSV, generateCustomerWhatsAppText } from '../utils/export';

interface CustomerLedgerViewProps {
  onOpenCustomerModal: (cust?: Customer) => void;
  onOpenCreditModal: (cust: Customer) => void;
  onOpenPaymentModal: (cust: Customer) => void;
  onDeleteCustomer: (cust: Customer) => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const CustomerLedgerView: React.FC<CustomerLedgerViewProps> = ({
  onOpenCustomerModal,
  onOpenCreditModal,
  onOpenPaymentModal,
  onDeleteCustomer,
  onViewTransaction,
}) => {
  const { customers, transactions, settings, unarchiveCustomer } = useLedger();

  const [search, setSearch] = useState('');
  const [filterBalance, setFilterBalance] = useState<'all' | 'due' | 'cleared'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // High-level statistics
  const stats = useMemo(() => {
    let totalReceivables = 0;
    let totalCredit = 0;
    let totalRecovered = 0;
    let activeWithDue = 0;

    customers.filter((c) => !c.isArchived).forEach((c) => {
      totalCredit += c.totalCreditGiven || 0;
      totalRecovered += c.totalPaymentReceived || 0;
      if (c.balance > 0) {
        totalReceivables += c.balance;
        activeWithDue += 1;
      }
    });

    return { totalReceivables, totalCredit, totalRecovered, activeWithDue };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => (showArchived ? c.isArchived : !c.isArchived))
      .filter((c) => {
        const matchesSearch =
          search === '' ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          (c.cnic && c.cnic.includes(search)) ||
          (c.address && c.address.toLowerCase().includes(search.toLowerCase()));

        const matchesBalance =
          filterBalance === 'all' ||
          (filterBalance === 'due' ? c.balance > 0 : c.balance <= 0);

        return matchesSearch && matchesBalance;
      });
  }, [customers, search, filterBalance, showArchived]);

  // Transactions for selected customer statement
  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter(
      (tx) =>
        tx.partyId === selectedCustomer.id ||
        (tx.partyType === 'customer' && tx.partyName === selectedCustomer.name)
    );
  }, [selectedCustomer, transactions]);

  const handleSendWhatsAppReminder = (cust: Customer) => {
    const text = encodeURIComponent(
      generateCustomerWhatsAppText(cust, settings.shopName, settings.phone)
    );
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Customer Receivables (Baqaya)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-amber-400">
            {formatPKR(stats.totalReceivables)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total Udhaar pending from {stats.activeWithDue} customers
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Credit Given (Jama Udhaar)</span>
            <span className="text-xs font-mono text-slate-500">{customers.length} registered</span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {formatPKR(stats.totalCredit)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative credit extended</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Recovered (Wasooli)</span>
            <span className="text-xs font-mono text-emerald-400">Received</span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-emerald-400">
            {formatPKR(stats.totalRecovered)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Payment collected from customers</p>
        </div>
      </div>

      {/* Main Customers Ledger Container */}
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
                placeholder="Search customer name, phone, address..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
              />
            </div>

            <select
              value={filterBalance}
              onChange={(e) => setFilterBalance(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              <option value="all">All Customers</option>
              <option value="due">Pending Balance (Baqaya Udhaar)</option>
              <option value="cleared">All Cleared (Zero Balance)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                showArchived
                  ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showArchived ? 'Showing Archived' : 'View Archived'}
            </button>
            <button
              onClick={() => exportCustomersToCSV(filteredCustomers)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => onOpenCustomerModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Customer (Grahak)</span>
            </button>
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-slate-400">No customers found.</p>
            <button
              onClick={() => onOpenCustomerModal()}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
            >
              Add First Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-4">Phone (WhatsApp)</th>
                  <th className="py-2.5 px-4">Area / Notes</th>
                  <th className="py-2.5 px-4 text-right">Total Credit</th>
                  <th className="py-2.5 px-4 text-right">Total Paid</th>
                  <th className="py-2.5 px-4 text-right">Remaining Balance (Baqaya)</th>
                  <th className="py-2.5 px-4 text-center">Quick Action</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-white">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="text-left hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {c.phone}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate">
                      {c.address || c.notes || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-300 tabular-nums">
                      {formatPKR(c.totalCreditGiven)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-400 tabular-nums">
                      {formatPKR(c.totalPaymentReceived)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      <span
                        className={
                          c.balance > 0
                            ? 'text-amber-400'
                            : c.balance < 0
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        }
                      >
                        {formatPKR(c.balance)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenPaymentModal(c)}
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30 cursor-pointer"
                          title="Record Payment Received"
                        >
                          + Wasooli
                        </button>
                        <button
                          onClick={() => onOpenCreditModal(c)}
                          className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-[10px] font-semibold border border-amber-500/30 cursor-pointer"
                          title="Give Credit / Udhaar"
                        >
                          + Udhaar
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {c.isArchived ? (
                        <button
                          onClick={() => unarchiveCustomer(c.id)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Restore Khata
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                            title="View Statement"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {c.balance > 0 && (
                            <button
                              onClick={() => handleSendWhatsAppReminder(c)}
                              className="p-1 rounded text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
                              title="Send WhatsApp Reminder"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onOpenCustomerModal(c)}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                            title="Edit Customer Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(c)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete / Archive Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Statement Modal (Khata Parchee) */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Khata Statement: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Phone: {selectedCustomer.phone} · Balance Pending: {formatPKR(selectedCustomer.balance)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendWhatsAppReminder(selectedCustomer)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Statement</span>
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">Total Credit</span>
                  <span className="text-sm font-bold font-mono text-white block mt-0.5">
                    {formatPKR(selectedCustomer.totalCreditGiven)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">Total Paid</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 block mt-0.5">
                    {formatPKR(selectedCustomer.totalPaymentReceived)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">Current Baqaya</span>
                  <span className="text-sm font-bold font-mono text-amber-400 block mt-0.5">
                    {formatPKR(selectedCustomer.balance)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Transaction History ({customerTransactions.length})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenPaymentModal(selectedCustomer);
                      setSelectedCustomer(null);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                  >
                    + Record Wasooli
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      onOpenCreditModal(selectedCustomer);
                      setSelectedCustomer(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    + Give Udhaar
                  </button>
                </div>
              </div>

              {customerTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No individual transaction vouchers recorded for this customer yet.
                </p>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-center">Voucher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {customerTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                            {formatPakDateTime(tx.date)}
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {tx.type === 'customer_payment' ? (
                              <span className="text-emerald-400">Payment (Wasooli)</span>
                            ) : tx.type === 'customer_credit' ? (
                              <span className="text-amber-400">Credit (Udhaar)</span>
                            ) : (
                              <span className="text-slate-300">{tx.type}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-300">{tx.description}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                            {tx.type === 'customer_payment' ? (
                              <span className="text-emerald-400">+{formatPKR(tx.amount)}</span>
                            ) : (
                              <span className="text-amber-400">-{formatPKR(tx.amount)}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => {
                                onViewTransaction(tx);
                                setSelectedCustomer(null);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-[11px]"
                            >
                              {tx.voucherNo}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
