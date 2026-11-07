import React, { useRef } from 'react';
import { X, Printer, Share2, Check, Download } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { Transaction } from '../../types';
import { formatPakDateTime, formatPKR } from '../../utils/formatters';

interface ReceiptVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptVoucherModal: React.FC<ReceiptVoucherModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { settings, accounts } = useLedger();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !transaction) return null;

  const account = accounts.find((a) => a.id === transaction.accountId);
  const toAccount = transaction.toAccountId
    ? accounts.find((a) => a.id === transaction.toAccountId)
    : null;

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppMessage = () => {
    const lines = [
      `*${settings.shopName}*`,
      `*FINANCIAL TRANSACTION RECEIPT*`,
      `---------------------------------`,
      `*Voucher No:* ${transaction.voucherNo}`,
      `*Date:* ${formatPakDateTime(transaction.date)}`,
      `*Type:* ${transaction.type.replace('_', ' ').toUpperCase()}`,
      `*Amount:* ${formatPKR(transaction.amount)}`,
      transaction.partyName ? `*Party:* ${transaction.partyName}` : '',
      `*Category:* ${transaction.category}`,
      `*Description:* ${transaction.description}`,
      transaction.notes ? `*Notes:* ${transaction.notes}` : '',
      `*Account:* ${account?.name || 'Cash Counter'}`,
      `---------------------------------`,
      `Software: HIKMAT LEDGER PRO`,
      `Developed by HIKMAT MOBILE SOFTWARE`,
    ].filter(Boolean);

    return encodeURIComponent(lines.join('\n'));
  };

  const handleShareWhatsApp = () => {
    const text = getWhatsAppMessage();
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const text = decodeURIComponent(getWhatsAppMessage());
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="no-print px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Transaction Voucher
            </span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">
              {transaction.voucherNo}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Body */}
        <div className="p-6 bg-white text-slate-900 font-sans print-card select-text">
          {/* Shop Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
              {settings.shopName}
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">{settings.tagline}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{settings.address}</p>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5">Phone: {settings.phone}</p>
          </div>

          {/* Voucher Title & Date */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs">
            <div className="flex justify-between items-center text-slate-500 mb-1">
              <span>Voucher No:</span>
              <span className="font-mono font-bold text-slate-900">{transaction.voucherNo}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 mb-1">
              <span>Date & Time:</span>
              <span className="font-mono text-slate-800">{formatPakDateTime(transaction.date)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Nature:</span>
              <span className="font-semibold text-slate-900 uppercase">
                {transaction.type.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1.5">
            {transaction.partyName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Party / Contact:</span>
                <span className="font-bold text-slate-900">{transaction.partyName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-medium text-slate-800">{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account / Channel:</span>
              <span className="font-medium text-slate-800">
                {account?.name || 'Cash Counter'}
                {toAccount ? ` ➔ ${toAccount.name}` : ''}
              </span>
            </div>
            {transaction.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-medium text-slate-800">{transaction.paymentMethod}</span>
              </div>
            )}
            {transaction.referenceNo && (
              <div className="flex justify-between">
                <span className="text-slate-500">Reference / Ref ID:</span>
                <span className="font-mono font-medium text-slate-800">{transaction.referenceNo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Classification:</span>
              <span className="text-slate-800">
                {transaction.isBusiness ? 'Shop Business' : 'Personal Expense'}
              </span>
            </div>

            {/* Custom Form Fields if any */}
            {transaction.customFieldValues && Object.keys(transaction.customFieldValues).length > 0 && (
              <div className="pt-1 border-t border-slate-100 space-y-1">
                {Object.entries(transaction.customFieldValues).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="text-slate-500 capitalize">{k.replace('field_', '').replace(/_/g, ' ')}:</span>
                    <span className="font-medium text-slate-800">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            {transaction.description && (
              <div className="pt-1 text-[11px] text-slate-700 bg-slate-50 p-2 rounded">
                <span className="font-semibold text-slate-900">Particulars: </span>
                {transaction.description}
              </div>
            )}
            {transaction.notes && (
              <div className="text-[10px] text-slate-500 italic">
                Note: {transaction.notes}
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="py-4 my-2 bg-slate-100 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Total Amount
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              {formatPKR(transaction.amount)}
            </span>
          </div>

          {/* Receipt Photo if available */}
          {transaction.receiptImage && (
            <div className="no-print my-3 p-2 border border-slate-200 rounded-lg">
              <p className="text-[10px] text-slate-500 mb-1 font-semibold uppercase">
                Attached Bill / Slip:
              </p>
              <img
                src={transaction.receiptImage}
                alt="Receipt"
                className="max-h-40 mx-auto rounded object-contain"
              />
            </div>
          )}

          {/* Signature & Developer Credit */}
          <div className="pt-6 mt-4 border-t border-dashed border-slate-300 text-center">
            <div className="flex justify-between items-end px-2 mb-4 text-[11px] text-slate-500">
              <div className="text-center">
                <div className="w-24 border-b border-slate-400 mb-1" />
                <span>Customer Sign</span>
              </div>
              <div className="text-center">
                <div className="w-24 border-b border-slate-400 mb-1" />
                <span>Authorized Sign</span>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 font-medium">
              System: HIKMAT LEDGER PRO · Powered by HIKMAT MOBILE SOFTWARE
            </p>
          </div>
        </div>

        {/* Modal Bottom Buttons (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyText}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Receipt Text!' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
