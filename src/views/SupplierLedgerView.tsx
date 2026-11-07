import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Phone,
  Search,
  Download,
  Building2,
  Edit2,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Supplier, Transaction } from '../types';
import { formatPakDate, formatPakDateTime, formatPKR } from '../utils/formatters';
import { exportSuppliersToCSV } from '../utils/export';

interface SupplierLedgerViewProps {
  onOpenSupplierModal: (sup?: Supplier) => void;
  onOpenPurchaseModal: (sup: Supplier) => void;
  onOpenPaymentModal: (sup: Supplier) => void;
  onDeleteSupplier: (sup: Supplier) => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const SupplierLedgerView: React.FC<SupplierLedgerViewProps> = ({
  onOpenSupplierModal,
  onOpenPurchaseModal,
  onOpenPaymentModal,
  onDeleteSupplier,
  onViewTransaction,
}) => {
  const { suppliers, transactions, settings, unarchiveSupplier } = useLedger();

  const [search, setSearch] = useState('');
  const [filterBalance, setFilterBalance] = useState<'all' | 'due' | 'cleared'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Stats
  const stats = useMemo(() => {
    let totalPayables = 0;
    let totalPurchases = 0;
    let totalPaid = 0;
    let activeWithDue = 0;

    suppliers.filter((s) => !s.isArchived).forEach((s) => {
      totalPurchases += s.totalPurchases || 0;
      totalPaid += s.totalPaid || 0;
      if (s.balance > 0) {
        totalPayables += s.balance;
        activeWithDue += 1;
      }
    });

    return { totalPayables, totalPurchases, totalPaid, activeWithDue };
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((s) => (showArchived ? s.isArchived : !s.isArchived))
      .filter((s) => {
        const matchesSearch =
          search === '' ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.companyName && s.companyName.toLowerCase().includes(search.toLowerCase())) ||
          s.phone.includes(search);

        const matchesBalance =
          filterBalance === 'all' ||
          (filterBalance === 'due' ? s.balance > 0 : s.balance <= 0);

        return matchesSearch && matchesBalance;
      });
  }, [suppliers, search, filterBalance, showArchived]);

  const supplierTransactions = useMemo(() => {
    if (!selectedSupplier) return [];
    return transactions.filter(
      (tx) =>
        tx.partyId === selectedSupplier.id ||
        (tx.partyType === 'supplier' && tx.partyName === selectedSupplier.name)
    );
  }, [selectedSupplier, transactions]);

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Supplier Payables (Dena)</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-purple-400">
            {formatPKR(stats.totalPayables)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total credit owed to {stats.activeWithDue} vendors/wholesalers
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Wholesale Purchases</span>
            <span className="text-xs font-mono text-slate-500">{suppliers.length} vendors</span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {formatPKR(stats.totalPurchases)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative parts & stock bought</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Paid to Suppliers</span>
            <span className="text-xs font-mono text-emerald-400">Cleared</span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-emerald-400">
            {formatPKR(stats.totalPaid)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total payments transferred to vendors</p>
        </div>
      </div>

      {/* Main Supplier Ledger Container */}
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
                placeholder="Search vendor name, market, company..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
              />
            </div>

            <select
              value={filterBalance}
              onChange={(e) => setFilterBalance(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              <option value="all">All Suppliers</option>
              <option value="due">Pending Dena (Owed Balance)</option>
              <option value="cleared">All Cleared (Nil)</option>
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
              onClick={() => exportSuppliersToCSV(filteredSuppliers)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => onOpenSupplierModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white rounded-xl transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>+ Add Supplier</span>
            </button>
          </div>
        </div>

        {/* Suppliers Table */}
        {filteredSuppliers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-slate-400">No suppliers found.</p>
            <button
              onClick={() => onOpenSupplierModal()}
              className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
            >
              Add First Supplier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Supplier / Contact</th>
                  <th className="py-2.5 px-4">Company / Wholesale Market</th>
                  <th className="py-2.5 px-4">Phone Number</th>
                  <th className="py-2.5 px-4 text-right">Total Purchases</th>
                  <th className="py-2.5 px-4 text-right">Total Paid</th>
                  <th className="py-2.5 px-4 text-right">Remaining Payable (Dena)</th>
                  <th className="py-2.5 px-4 text-center">Quick Action</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-white">
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        className="text-left hover:text-purple-400 transition-colors cursor-pointer"
                      >
                        {s.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {s.companyName || s.address || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {s.phone}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-300 tabular-nums">
                      {formatPKR(s.totalPurchases)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-400 tabular-nums">
                      {formatPKR(s.totalPaid)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      <span
                        className={
                          s.balance > 0
                            ? 'text-purple-400'
                            : s.balance < 0
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        }
                      >
                        {formatPKR(s.balance)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenPaymentModal(s)}
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30 cursor-pointer"
                          title="Record Payment Made to Supplier"
                        >
                          + Pay Bill
                        </button>
                        <button
                          onClick={() => onOpenPurchaseModal(s)}
                          className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-[10px] font-semibold border border-purple-500/30 cursor-pointer"
                          title="Record Purchase on Credit"
                        >
                          + Purchase
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {s.isArchived ? (
                        <button
                          onClick={() => unarchiveSupplier(s.id)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedSupplier(s)}
                            className="p-1 rounded text-slate-400 hover:text-purple-400 hover:bg-slate-800"
                            title="View Statement"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenSupplierModal(s)}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSupplier(s)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete Supplier"
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

      {/* Supplier Statement Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Vendor Ledger: {selectedSupplier.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedSupplier.companyName || selectedSupplier.phone} · Total Payable: {formatPKR(selectedSupplier.balance)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">Total Purchases</span>
                  <span className="text-sm font-bold font-mono text-white block mt-0.5">
                    {formatPKR(selectedSupplier.totalPurchases)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">Total Paid</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 block mt-0.5">
                    {formatPKR(selectedSupplier.totalPaid)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase">Remaining Dena</span>
                  <span className="text-sm font-bold font-mono text-purple-400 block mt-0.5">
                    {formatPKR(selectedSupplier.balance)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Payment & Purchase History ({supplierTransactions.length})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenPaymentModal(selectedSupplier);
                      setSelectedSupplier(null);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    + Record Payment Made
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      onOpenPurchaseModal(selectedSupplier);
                      setSelectedSupplier(null);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                  >
                    + Record Purchase
                  </button>
                </div>
              </div>

              {supplierTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No individual transaction vouchers recorded for this supplier yet.
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
                      {supplierTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                            {formatPakDateTime(tx.date)}
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {tx.type === 'supplier_payment' ? (
                              <span className="text-emerald-400">Payment Made</span>
                            ) : (
                              <span className="text-purple-400">Stock Purchase</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-300">{tx.description}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                            {formatPKR(tx.amount)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => {
                                onViewTransaction(tx);
                                setSelectedSupplier(null);
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
                onClick={() => setSelectedSupplier(null)}
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
