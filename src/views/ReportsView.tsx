import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatPakDate, formatPakDateTime, formatPKR, isThisMonth, isToday } from '../utils/formatters';
import { exportTransactionsToCSV, generateDailySummaryShareText } from '../utils/export';
import { Transaction } from '../types';

export const ReportsView: React.FC = () => {
  const { transactions, accounts, categories, settings, summary } = useLedger();

  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Transactions within selected report period
  const periodTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      const d = new Date(tx.date);

      if (reportPeriod === 'daily') {
        return isToday(tx.date);
      }
      if (reportPeriod === 'weekly') {
        return now.getTime() - d.getTime() <= 7 * 86400000;
      }
      if (reportPeriod === 'monthly') {
        return isThisMonth(tx.date);
      }
      if (reportPeriod === 'yearly') {
        return d.getFullYear() === now.getFullYear();
      }
      if (reportPeriod === 'custom' && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;
      }
      return true;
    });
  }, [transactions, reportPeriod, customStart, customEnd]);

  // Core Financial Accounting breakdown for the period
  const reportData = useMemo(() => {
    let revenue = 0; // Operating sales, repairs, accessories
    let customerRecovery = 0; // Wasooli
    let directCosts = 0; // Parts, wholesale mobile stock bought
    let operatingExpenses = 0; // Rent, electricity, tea, staff, transport
    let personalExpenses = 0; // Owner personal/home expenses (Drawings)
    let totalCashInflow = 0;
    let totalCashOutflow = 0;

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    periodTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;

      if (tx.type === 'income') {
        revenue += amt;
        totalCashInflow += amt;
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + amt;
      } else if (tx.type === 'customer_payment') {
        customerRecovery += amt;
        totalCashInflow += amt;
        incomeByCategory['Customer Debt Recovery'] = (incomeByCategory['Customer Debt Recovery'] || 0) + amt;
      } else if (tx.type === 'expense') {
        if (tx.isBusiness) {
          // Check if direct parts/wholesale or general operational
          if (tx.category.toLowerCase().includes('part') || tx.category.toLowerCase().includes('cost')) {
            directCosts += amt;
          } else {
            operatingExpenses += amt;
          }
          totalCashOutflow += amt;
          expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + amt;
        } else {
          // Personal drawings
          personalExpenses += amt;
          totalCashOutflow += amt;
          expenseByCategory[`[Personal] ${tx.category}`] = (expenseByCategory[`[Personal] ${tx.category}`] || 0) + amt;
        }
      } else if (tx.type === 'supplier_payment') {
        directCosts += amt;
        totalCashOutflow += amt;
        expenseByCategory['Supplier Debt Payment'] = (expenseByCategory['Supplier Debt Payment'] || 0) + amt;
      }
    });

    const totalBusinessRevenue = revenue + customerRecovery;
    const totalBusinessExpenses = directCosts + operatingExpenses;
    const grossProfit = totalBusinessRevenue - directCosts;
    const netBusinessProfit = totalBusinessRevenue - totalBusinessExpenses;
    const netCashFlow = totalCashInflow - totalCashOutflow;

    return {
      revenue,
      customerRecovery,
      totalBusinessRevenue,
      directCosts,
      operatingExpenses,
      totalBusinessExpenses,
      grossProfit,
      netBusinessProfit,
      personalExpenses,
      totalCashInflow,
      totalCashOutflow,
      netCashFlow,
      incomeByCategory,
      expenseByCategory,
    };
  }, [periodTransactions]);

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const accMap = accounts.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {});
    exportTransactionsToCSV(periodTransactions, accMap, `Financial_Report_${reportPeriod}`);
  };

  const handleShareWhatsApp = () => {
    const dateTitle = reportPeriod.toUpperCase();
    const text = encodeURIComponent(
      `*${settings.shopName} — FINANCIAL REPORT (${dateTitle})*
Period: ${reportPeriod}
Date: ${formatPakDate(new Date())}

*Business Revenue:* ${formatPKR(reportData.totalBusinessRevenue)}
*Direct Costs & Parts:* ${formatPKR(reportData.directCosts)}
*Operating Expenses:* ${formatPKR(reportData.operatingExpenses)}
*NET BUSINESS PROFIT:* ${formatPKR(reportData.netBusinessProfit)}

*Personal / Home Drawings:* ${formatPKR(reportData.personalExpenses)}
*Net Cash Inflow/Outflow:* ${formatPKR(reportData.netCashFlow)}

_Generated by HIKMAT LEDGER PRO_
_Developed by HIKMAT MOBILE SOFTWARE_`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Report Control Strip (Hidden in Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Financial Statements & P&L Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accurate revenue, direct costs, operational overhead & net profit
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setReportPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  reportPeriod === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-xl cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {reportPeriod === 'custom' && (
        <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 text-xs">
          <span className="text-slate-300 font-semibold">Custom Range:</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>
        </div>
      )}

      {/* Printable Report Document Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 print-card">
        {/* Printable Letterhead Header */}
        <div className="pb-6 mb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-blue-400 uppercase font-bold tracking-widest block">
              FINANCIAL STATEMENT & PROFIT LOSS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {settings.shopName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Phone: {settings.phone} · Address: {settings.address}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-300 block">
              Period: {reportPeriod.toUpperCase()} REPORT
            </span>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">
              Generated: {formatPakDateTime(new Date())}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Software: HIKMAT LEDGER PRO
            </span>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</span>
            <div className="text-xl font-black font-mono text-emerald-400 mt-1">
              {formatPKR(reportData.totalBusinessRevenue)}
            </div>
            <span className="text-[10px] text-slate-500">Sales & Services</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Direct Costs & Parts</span>
            <div className="text-xl font-black font-mono text-amber-400 mt-1">
              {formatPKR(reportData.directCosts)}
            </div>
            <span className="text-[10px] text-slate-500">Screens & Spares</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Operating Overhead</span>
            <div className="text-xl font-black font-mono text-rose-400 mt-1">
              {formatPKR(reportData.operatingExpenses)}
            </div>
            <span className="text-[10px] text-slate-500">Rent, Bills, Staff</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Business Profit</span>
            <div
              className={`text-xl font-black font-mono mt-1 ${
                reportData.netBusinessProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatPKR(reportData.netBusinessProfit)}
            </div>
            <span className="text-[10px] text-slate-500">Khaalis Munafa</span>
          </div>
        </div>

        {/* Detailed Profit & Loss Statement Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* P&L Breakdown Table */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Profit & Loss Statement (Karobari Hisab)</span>
              <span className="text-[10px] text-slate-500 font-normal">Double-Entry Verified</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-300 font-medium">1. Gross Business Revenue (Sales & Services)</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  +{formatPKR(reportData.revenue)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-300 font-medium">2. Customer Credit Recoveries (Wasooli)</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  +{formatPKR(reportData.customerRecovery)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 bg-slate-900/50 px-2 rounded font-semibold">
                <span className="text-white">Total Business Income</span>
                <span className="font-mono text-emerald-400">
                  {formatPKR(reportData.totalBusinessRevenue)}
                </span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80 text-slate-400">
                  <span>Less: Direct Mobile Parts & Wholesale Stock</span>
                  <span className="font-mono text-rose-400">-{formatPKR(reportData.directCosts)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 bg-slate-900/50 px-2 rounded font-semibold text-xs">
                  <span className="text-slate-200">Gross Margin</span>
                  <span className="font-mono text-white">{formatPKR(reportData.grossProfit)}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80 text-slate-400">
                  <span>Less: Operating Overhead (Rent, Electricity, Tea, Salaries)</span>
                  <span className="font-mono text-rose-400">
                    -{formatPKR(reportData.operatingExpenses)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-700 flex justify-between items-center bg-blue-950/20 p-2.5 rounded-lg">
                <div>
                  <span className="text-sm font-bold text-white block">
                    NET BUSINESS PROFIT (MUNĀFA)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Formula: Revenue - Direct Costs - Operating Expenses
                  </span>
                </div>
                <span
                  className={`text-lg font-black font-mono tabular-nums ${
                    reportData.netBusinessProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatPKR(reportData.netBusinessProfit)}
                </span>
              </div>

              <div className="pt-2 text-[11px] text-slate-500">
                <span className="font-semibold text-purple-400">Notice: </span>
                Personal expenses & home drawings ({formatPKR(reportData.personalExpenses)}) are kept
                strictly separate from business net profit to ensure legitimate shop accounting.
              </div>
            </div>
          </div>

          {/* Cash Flow & Category Distribution */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Cash Flow Reconciliation
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Total Cash & Digital Inflow</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    +{formatPKR(reportData.totalCashInflow)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Cash Outflow (Business + Personal)</span>
                  <span className="font-mono font-semibold text-rose-400">
                    -{formatPKR(reportData.totalCashOutflow)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                  <span className="text-white">Net Net Cash Flow</span>
                  <span
                    className={`font-mono ${
                      reportData.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPKR(reportData.netCashFlow)}
                  </span>
                </div>
              </div>
            </div>

            {/* Income by Category Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Income Category Breakdown
              </h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(reportData.incomeByCategory).length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No income categories recorded.</p>
                ) : (
                  Object.entries(reportData.incomeByCategory).map(([cat, val]) => {
                    const pct =
                      reportData.totalBusinessRevenue > 0
                        ? Math.round((val / reportData.totalBusinessRevenue) * 100)
                        : 0;
                    return (
                      <div key={cat} className="space-y-0.5">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>{cat}</span>
                          <span className="font-mono text-white">
                            {formatPKR(val)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Expense by Category Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Expense Category Breakdown
              </h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(reportData.expenseByCategory).length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No expenses recorded.</p>
                ) : (
                  Object.entries(reportData.expenseByCategory).map(([cat, val]) => {
                    const totalAllExp = reportData.totalCashOutflow || 1;
                    const pct = Math.round((val / totalAllExp) * 100);
                    return (
                      <div key={cat} className="space-y-0.5">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>{cat}</span>
                          <span className="font-mono text-white">
                            {formatPKR(val)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-rose-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Developer Branding Footer */}
        <div className="pt-4 mt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-400">
            HIKMAT LEDGER PRO · Official Accounting Audit Statement
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Developed & Maintained by HIKMAT MOBILE SOFTWARE · Pakistan
          </p>
        </div>
      </div>
    </div>
  );
};
