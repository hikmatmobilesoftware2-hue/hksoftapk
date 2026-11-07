import { Customer, FinancialSummary, Supplier, Transaction } from '../types';
import { formatPakDate, formatPakDateTime, formatPKR } from './formatters';

/**
 * Download a string content as a file (CSV, JSON, etc.)
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clean string for CSV escaping
 */
function escapeCsv(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Transactions to CSV (Excel Compatible with UTF-8 BOM)
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  accountMap: Record<string, string> | { id: string; name: string }[],
  filterName: string = 'All_Transactions'
) {
  const map: Record<string, string> = Array.isArray(accountMap)
    ? accountMap.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {})
    : accountMap;

  const headers = [
    'Voucher No',
    'Date & Time',
    'Type',
    'Category',
    'Classification',
    'Account',
    'Party / Contact',
    'Amount (PKR)',
    'Description',
    'Notes',
  ];

  const rows = transactions.map((tx) => [
    escapeCsv(tx.voucherNo),
    escapeCsv(formatPakDateTime(tx.date)),
    escapeCsv(tx.type.replace('_', ' ').toUpperCase()),
    escapeCsv(tx.category),
    escapeCsv(tx.isBusiness ? 'Shop Business' : 'Personal / Zaati'),
    escapeCsv(map[tx.accountId] || tx.accountId),
    escapeCsv(tx.partyName || '-'),
    escapeCsv(tx.amount),
    escapeCsv(tx.description),
    escapeCsv(tx.notes || ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = formatPakDate(new Date()).replace(/-/g, '_');
  downloadFile(csvContent, `Hikmat_Ledger_${filterName}_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export Customers Khata to CSV
 */
export function exportCustomersToCSV(customers: Customer[]) {
  const headers = [
    'Customer Name',
    'Phone Number',
    'Address',
    'Total Credit (PKR)',
    'Total Paid (PKR)',
    'Remaining Balance (PKR)',
    'Notes',
  ];

  const rows = customers.map((c) => [
    escapeCsv(c.name),
    escapeCsv(c.phone),
    escapeCsv(c.address || ''),
    escapeCsv(c.totalCreditGiven),
    escapeCsv(c.totalPaymentReceived),
    escapeCsv(c.balance),
    escapeCsv(c.notes || ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = formatPakDate(new Date()).replace(/-/g, '_');
  downloadFile(csvContent, `Hikmat_Ledger_Customer_Khata_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export Suppliers Khata to CSV
 */
export function exportSuppliersToCSV(suppliers: Supplier[]) {
  const headers = [
    'Supplier Name',
    'Company Name',
    'Phone Number',
    'Total Purchases (PKR)',
    'Total Paid (PKR)',
    'Remaining Payable (PKR)',
    'Notes',
  ];

  const rows = suppliers.map((s) => [
    escapeCsv(s.name),
    escapeCsv(s.companyName || ''),
    escapeCsv(s.phone),
    escapeCsv(s.totalPurchases),
    escapeCsv(s.totalPaid),
    escapeCsv(s.balance),
    escapeCsv(s.notes || ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = formatPakDate(new Date()).replace(/-/g, '_');
  downloadFile(csvContent, `Hikmat_Ledger_Supplier_Khata_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Generate WhatsApp Message for Customer Udhaar Reminder
 */
export function generateCustomerWhatsAppText(customer: Customer, shopName: string, phone: string): string {
  return `Assalam-o-Alaikum ${customer.name} Bhai,

This is a gentle payment reminder from *${shopName}*.

Your current Khata statement:
• Total Credit: ${formatPKR(customer.totalCreditGiven)}
• Total Paid: ${formatPKR(customer.totalPaymentReceived)}
• *Remaining Balance (Baqaya): ${formatPKR(customer.balance)}*

Please clear your pending balance at your earliest convenience.
Contact: ${phone}

Thank you!
*HIKMAT LEDGER PRO*`;
}

/**
 * Generate Daily Financial Summary for WhatsApp / Sharing
 */
export function generateDailySummaryShareText(summary: FinancialSummary, shopName: string): string {
  const todayStr = formatPakDate(new Date());
  return `*DAILY FINANCIAL REPORT — ${shopName}*
Date: ${todayStr}

• *Today Income:* ${formatPKR(summary.todayIncome)}
• *Today Expenses:* ${formatPKR(summary.todayExpense)}
• *Today Net Profit:* ${formatPKR(summary.todayProfit)}
• *Personal Expenses:* ${formatPKR(summary.todayPersonalExpense)}

*Current Balances:*
• Shop Cash in Hand: ${formatPKR(summary.totalShopCash)}
• Bank Balance: ${formatPKR(summary.totalBank)}
• Online Wallet: ${formatPKR(summary.totalWallet)}
• Customer Receivables (Udhaar): ${formatPKR(summary.totalReceivables)}
• Supplier Payables (Dena): ${formatPKR(summary.totalPayables)}

_Generated by HIKMAT LEDGER PRO_
_Developed by HIKMAT MOBILE SOFTWARE_`;
}
