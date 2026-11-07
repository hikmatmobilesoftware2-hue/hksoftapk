import React, { useState } from 'react';
import {
  DatabaseBackup,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  History,
  FileCode,
  AlertTriangle,
  CheckCircle,
  FolderDown,
  Sparkles,
  Archive,
  RefreshCw,
  Trash2,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatPakDate, formatPakDateTime, formatPKR } from '../utils/formatters';
import { downloadFile, exportTransactionsToCSV } from '../utils/export';

export const BackupRestoreView: React.FC = () => {
  const {
    transactions,
    archivedTransactions,
    customers,
    suppliers,
    accounts,
    categories,
    backups,
    settings,
    createManualBackup,
    restoreFromJSON,
    exportDatabaseJSON,
    resetDatabase,
    loadSampleData,
    archiveTransactionsBeforeDate,
    recoverArchivedTransactions,
    deleteSelectedTransactions,
    exportFilteredTransactions,
  } = useLedger();

  const [restoreMessage, setRestoreMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [snapshotName, setSnapshotName] = useState('');

  // Export Selected Transactions Filter
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportAccountId, setExportAccountId] = useState('');
  const [exportCategory, setExportCategory] = useState('');

  // Archival date
  const [archiveCutoffDate, setArchiveCutoffDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3); // 3 months ago default
    return d.toISOString().split('T')[0];
  });

  const handleDownloadBackupFile = () => {
    const json = exportDatabaseJSON();
    const dateStr = formatPakDate(new Date()).replace(/-/g, '_');
    const filename = `Hikmat_Ledger_Pro_Full_Backup_${dateStr}.json`;
    downloadFile(json, filename, 'application/json');
    createManualBackup(`Exported full backup file: ${filename}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          if (confirm('Restoring this backup will update application data. Do you wish to continue?')) {
            const res = restoreFromJSON(content);
            if (res.success) {
              setRestoreMessage({ text: 'Database successfully restored from JSON backup!' });
            } else {
              setRestoreMessage({ text: res.error || 'Failed to restore backup', error: true });
            }
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateSnapshot = () => {
    createManualBackup(snapshotName.trim() || `Manual Snapshot (${formatPakDateTime(new Date())})`);
    setSnapshotName('');
    setRestoreMessage({ text: 'New backup snapshot saved to secure local storage!' });
    setTimeout(() => setRestoreMessage(null), 3000);
  };

  const handleRestoreSnapshot = (backupJson: string, label: string) => {
    if (confirm(`Restore snapshot "${label}"? This will overwrite existing unsaved changes.`)) {
      const res = restoreFromJSON(backupJson);
      if (res.success) {
        setRestoreMessage({ text: `Successfully restored snapshot "${label}"!` });
      } else {
        setRestoreMessage({ text: res.error || 'Failed to restore', error: true });
      }
    }
  };

  // Export Selected Transactions (CSV & JSON)
  const handleExportSelectedCSV = () => {
    const filtered = exportFilteredTransactions({
      startDate: exportStartDate ? `${exportStartDate}T00:00` : undefined,
      endDate: exportEndDate ? `${exportEndDate}T23:59` : undefined,
      accountId: exportAccountId || undefined,
      categoryId: exportCategory || undefined,
    });

    if (filtered.length === 0) {
      alert('No transactions match the selected criteria.');
      return;
    }

    exportTransactionsToCSV(filtered, accounts);
    setRestoreMessage({ text: `Exported ${filtered.length} filtered transactions to CSV!` });
  };

  const handleExportSelectedJSON = () => {
    const filtered = exportFilteredTransactions({
      startDate: exportStartDate ? `${exportStartDate}T00:00` : undefined,
      endDate: exportEndDate ? `${exportEndDate}T23:59` : undefined,
      accountId: exportAccountId || undefined,
      categoryId: exportCategory || undefined,
    });

    if (filtered.length === 0) {
      alert('No transactions match the selected criteria.');
      return;
    }

    const json = JSON.stringify({ exportedAt: new Date().toISOString(), count: filtered.length, transactions: filtered }, null, 2);
    downloadFile(json, `Selected_Transactions_${filtered.length}_records.json`, 'application/json');
    setRestoreMessage({ text: `Exported ${filtered.length} filtered transactions to JSON!` });
  };

  // Archive Historical Records
  const handleArchiveHistorical = () => {
    if (!archiveCutoffDate) return;
    if (
      confirm(
        `Archive transactions recorded before ${archiveCutoffDate}? Archived records are safely stored and can be recovered at any time.`
      )
    ) {
      const count = archiveTransactionsBeforeDate(`${archiveCutoffDate}T23:59`);
      setRestoreMessage({
        text: count > 0 ? `Archived ${count} old transactions safely!` : 'No records found before this date.',
      });
    }
  };

  // Recover Archived Records
  const handleRecoverAllArchived = () => {
    if (archivedTransactions.length === 0) return;
    if (confirm(`Recover all ${archivedTransactions.length} archived records back to the active ledger?`)) {
      recoverArchivedTransactions();
      setRestoreMessage({ text: 'All archived records recovered to active ledger!' });
    }
  };

  // Bulk Delete Filtered Records (with automatic safety backup!)
  const handleDeleteFilteredRecords = () => {
    const filtered = exportFilteredTransactions({
      startDate: exportStartDate ? `${exportStartDate}T00:00` : undefined,
      endDate: exportEndDate ? `${exportEndDate}T23:59` : undefined,
      accountId: exportAccountId || undefined,
      categoryId: exportCategory || undefined,
    });

    if (filtered.length === 0) {
      alert('No transactions match the selected delete filter.');
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete these ${filtered.length} records? (An automatic safety backup snapshot will be created before deletion).`
      )
    ) {
      deleteSelectedTransactions(filtered.map((t) => t.id));
      setRestoreMessage({
        text: `Deleted ${filtered.length} records. Automatic safety snapshot backup created.`,
      });
    }
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to completely RESET the database? All records will be cleared. (An emergency snapshot backup will be created first).'
      )
    ) {
      resetDatabase();
      setRestoreMessage({ text: 'Database has been reset to clean state.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">100% Offline Database Protected</span>
            <span>·</span>
            <span>Local Persistent Storage & JSON Redundancy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Database Backup & Data Management Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete data control: backup, restore, export filtered records, archive historical logs, and audit snapshots
          </p>
        </div>

        <button
          onClick={handleDownloadBackupFile}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <FolderDown className="w-4 h-4" />
          <span>Download Full Backup (JSON)</span>
        </button>
      </div>

      {restoreMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            restoreMessage.error
              ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
              : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {restoreMessage.error ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{restoreMessage.text}</span>
          </div>
          <button
            onClick={() => setRestoreMessage(null)}
            className="text-[11px] font-semibold underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Database Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Transactions</span>
          <span className="text-xl font-black font-mono text-white block mt-1">
            {transactions.length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Archived Records</span>
          <span className="text-xl font-black font-mono text-amber-400 block mt-1">
            {archivedTransactions.length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Parties (Customers & Suppliers)</span>
          <span className="text-xl font-black font-mono text-white block mt-1">
            {customers.length + suppliers.length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Categories & Accounts</span>
          <span className="text-xl font-black font-mono text-white block mt-1">
            {categories.length + accounts.length}
          </span>
        </div>
      </div>

      {/* SECTION 1: Export Selected Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Export & Manage Selected Transactions</h3>
            <p className="text-[11px] text-slate-400">
              Filter by date, account, or category, then export to CSV or JSON
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Filter Account
            </label>
            <select
              value={exportAccountId}
              onChange={(e) => setExportAccountId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Filter Category
            </label>
            <select
              value={exportCategory}
              onChange={(e) => setExportCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelectedCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Filtered to CSV</span>
            </button>
            <button
              onClick={handleExportSelectedJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export Filtered to JSON</span>
            </button>
          </div>

          <button
            onClick={handleDeleteFilteredRecords}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected Records (With Auto-Backup)</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Archival & Recovery of Old Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Archive & Recover Historical Records</h3>
            <p className="text-[11px] text-slate-400">
              Clean up daily active lists by moving old transactions to safe archive without losing data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white block">Archive Transactions Prior to Date</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={archiveCutoffDate}
                onChange={(e) => setArchiveCutoffDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
              <button
                onClick={handleArchiveHistorical}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Archive Records
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Archived records are hidden from active transaction lists to keep the app blazing fast.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                Recover Archived Records ({archivedTransactions.length} archived)
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Restore previously archived transactions back into the main active ledger at any time.
              </p>
            </div>

            <button
              disabled={archivedTransactions.length === 0}
              onClick={handleRecoverAllArchived}
              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recover All ({archivedTransactions.length}) Archived Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Backup Snapshots & Restore File */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Snapshot Maker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <DatabaseBackup className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Instant Local Snapshot</h3>
              <p className="text-[11px] text-slate-400">Save a restore point in browser storage</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="e.g. End of Day Closing Snapshot"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white"
            />
            <button
              onClick={handleCreateSnapshot}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Take Snapshot Now
            </button>
          </div>
        </div>

        {/* Restore from File Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Restore from Backup File</h3>
              <p className="text-[11px] text-slate-400">Upload a previously exported JSON backup</p>
            </div>
          </div>

          <label className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
            <FileCode className="w-6 h-6 text-slate-500 mb-2" />
            <span className="text-xs font-medium text-slate-300">Click to Select Backup JSON File</span>
            <span className="text-[10px] text-slate-500 mt-1">.json files supported</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Stored Local Snapshots</h3>
          </div>
          <span className="text-xs text-slate-500">{backups.length} snapshots available</span>
        </div>

        {backups.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No local snapshots created yet. Click "Take Snapshot Now" or "Download Full Backup".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Snapshot Label</th>
                  <th className="py-2.5 px-4">Created Time</th>
                  <th className="py-2.5 px-4">Transactions</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-semibold text-white">{b.label}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono">
                      {formatPakDateTime(b.timestamp, settings.dateFormat)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">
                      {b.transactionCount} records
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleRestoreSnapshot(b.data, b.label)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Restore Snapshot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Danger Zone: Reset or Load Sample Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Maintenance & Reset
        </h3>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Need sample test data or a clean slate?</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reset database to start afresh or load standard Pakistani mobile shop starter data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Load demo shop records (Infinix, Vivo LCDs, wholesale parts)?')) {
                  loadSampleData();
                  setRestoreMessage({ text: 'Standard mobile shop sample data loaded!' });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Shop Demo Data</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-xs font-medium text-rose-300 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
