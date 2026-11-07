import React from 'react';
import { X, Sliders, Eye, EyeOff, ArrowUp, ArrowDown, LayoutGrid, CheckCircle } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { DashboardCardConfig } from '../../types';

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateDashboardSettings, reorderDashboardCards, toggleDashboardCard } = useLedger();

  if (!isOpen) return null;

  const cards = settings.dashboard.cards;

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCards = [...cards];
    const temp = newCards[index - 1];
    newCards[index - 1] = newCards[index];
    newCards[index] = temp;
    reorderDashboardCards(newCards);
  };

  const handleMoveDown = (index: number) => {
    if (index === cards.length - 1) return;
    const newCards = [...cards];
    const temp = newCards[index + 1];
    newCards[index + 1] = newCards[index];
    newCards[index] = temp;
    reorderDashboardCards(newCards);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Customize Dashboard Layout & Cards
              </h3>
              <p className="text-xs text-slate-400">
                Choose which financial metrics appear, rearrange order, and show/hide shop vs personal figures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Shop vs Personal Figures Global Visibility Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Shop Business Figures</span>
                <span className="text-[11px] text-slate-400">Revenue, costs, profits & shop cash</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateDashboardSettings({
                    showShopStats: !settings.dashboard.showShopStats,
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settings.dashboard.showShopStats
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.dashboard.showShopStats ? 'Shown' : 'Hidden'}
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Personal / Household Figures</span>
                <span className="text-[11px] text-slate-400">Personal cash, drawings & zaati kharch</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateDashboardSettings({
                    showPersonalStats: !settings.dashboard.showPersonalStats,
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settings.dashboard.showPersonalStats
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.dashboard.showPersonalStats ? 'Shown' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* Grid Layout Density */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Dashboard Cards Grid Density
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => updateDashboardSettings({ layoutMode: 'grid_4' })}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  settings.dashboard.layoutMode === 'grid_4'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                4 Columns (Spacious)
              </button>
              <button
                type="button"
                onClick={() => updateDashboardSettings({ layoutMode: 'grid_3' })}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  settings.dashboard.layoutMode === 'grid_3'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3 Columns (Medium)
              </button>
              <button
                type="button"
                onClick={() => updateDashboardSettings({ layoutMode: 'compact' })}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  settings.dashboard.layoutMode === 'compact'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compact Mobile Grid
              </button>
            </div>
          </div>

          {/* Individual Dashboard Cards List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Dashboard Metric Cards ({cards.filter((c) => c.isEnabled).length} active)
              </label>
              <span className="text-[11px] text-slate-400">Use arrows to rearrange card order</span>
            </div>

            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                    card.isEnabled ? 'bg-slate-950' : 'bg-slate-950/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-mono text-slate-500 font-bold">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDashboardCard(card.id)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {card.isEnabled ? (
                        <Eye className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {card.title} {card.urduTitle && <span className="text-slate-400 font-normal">({card.urduTitle})</span>}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {card.category} category
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 cursor-pointer"
                      title="Move card up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cards.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 cursor-pointer"
                      title="Move card down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDashboardCard(card.id)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-medium cursor-pointer ${
                        card.isEnabled
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {card.isEnabled ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
