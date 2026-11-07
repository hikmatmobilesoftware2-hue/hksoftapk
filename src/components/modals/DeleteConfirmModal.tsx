import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemDetails?: {
    voucherNo?: string;
    amount?: number;
    partyName?: string;
  };
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">{description}</p>

        {itemDetails && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mb-5 text-xs text-left space-y-1">
            {itemDetails.voucherNo && (
              <div className="flex justify-between text-slate-400">
                <span>Voucher No:</span>
                <span className="font-mono text-white font-semibold">
                  {itemDetails.voucherNo}
                </span>
              </div>
            )}
            {itemDetails.amount !== undefined && (
              <div className="flex justify-between text-slate-400">
                <span>Amount:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {formatPKR(itemDetails.amount)}
                </span>
              </div>
            )}
            {itemDetails.partyName && (
              <div className="flex justify-between text-slate-400">
                <span>Party:</span>
                <span className="text-white font-medium">{itemDetails.partyName}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl transition-colors cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
