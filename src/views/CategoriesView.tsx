import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Wrench,
  Package,
  Cpu,
  Receipt,
  RefreshCw,
  Building,
  Zap,
  Wifi,
  Coffee,
  Truck,
  Layers,
  Key,
  Users,
  User,
  Home,
  Shield,
  PlusCircle,
  MinusCircle,
  ShoppingBag,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Category } from '../types';
import { CategoryModal } from '../components/modals/CategoryModal';

export const CategoriesView: React.FC = () => {
  const {
    categories,
    deleteCategory,
    toggleCategoryStatus,
    reorderCategories,
    unarchiveCategory,
    transactions,
  } = useLedger();

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredCategories = categories
    .filter((c) => (showArchived ? c.isArchived : !c.isArchived))
    .filter((c) => (activeTab === 'all' ? true : c.type === activeTab))
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.urduName && c.urduName.includes(q))
      );
    });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = (cat: Category) => {
    const isUsed = transactions.some((t) => t.category === cat.name || t.categoryId === cat.id);
    const confirmMsg = isUsed
      ? `Category "${cat.name}" is used in historical transactions. To preserve financial history, it will be safely archived (hidden from new forms, but preserved on past reports). Proceed?`
      : `Are you sure you want to delete category "${cat.name}"?`;

    if (confirm(confirmMsg)) {
      const res = deleteCategory(cat.id);
      if (res.archived) {
        setFeedback(`Category "${cat.name}" safely archived. Historical transactions preserved.`);
      } else {
        setFeedback(`Category "${cat.name}" deleted.`);
      }
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    const itemIndex = categories.indexOf(filteredCategories[index]);
    const prevItemIndex = categories.indexOf(filteredCategories[index - 1]);
    if (itemIndex > -1 && prevItemIndex > -1) {
      const temp = newCategories[prevItemIndex];
      newCategories[prevItemIndex] = newCategories[itemIndex];
      newCategories[itemIndex] = temp;
      reorderCategories(newCategories);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index === filteredCategories.length - 1) return;
    const newCategories = [...categories];
    const itemIndex = categories.indexOf(filteredCategories[index]);
    const nextItemIndex = categories.indexOf(filteredCategories[index + 1]);
    if (itemIndex > -1 && nextItemIndex > -1) {
      const temp = newCategories[nextItemIndex];
      newCategories[nextItemIndex] = newCategories[itemIndex];
      newCategories[itemIndex] = temp;
      reorderCategories(newCategories);
    }
  };

  const renderIcon = (iconName?: string, color?: string) => {
    const props = { className: 'w-4 h-4', style: { color: color || '#3B82F6' } };
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone {...props} />;
      case 'Wrench':
        return <Wrench {...props} />;
      case 'Package':
        return <Package {...props} />;
      case 'Cpu':
        return <Cpu {...props} />;
      case 'Receipt':
        return <Receipt {...props} />;
      case 'RefreshCw':
        return <RefreshCw {...props} />;
      case 'Building':
        return <Building {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Wifi':
        return <Wifi {...props} />;
      case 'Coffee':
        return <Coffee {...props} />;
      case 'Truck':
        return <Truck {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      case 'Key':
        return <Key {...props} />;
      case 'Users':
        return <Users {...props} />;
      case 'User':
        return <User {...props} />;
      case 'Home':
        return <Home {...props} />;
      case 'ShoppingBag':
        return <ShoppingBag {...props} />;
      case 'PlusCircle':
        return <PlusCircle {...props} />;
      case 'MinusCircle':
        return <MinusCircle {...props} />;
      default:
        return <Tag {...props} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span>Dynamic Accounting Modules</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">{categories.filter((c) => !c.isArchived).length} Active Categories</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Custom Category Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add unlimited shop and personal categories with icons, colors, business separation, and safe archival
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Custom Category</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[11px] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs: All / Income / Expense */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({categories.filter((c) => !c.isArchived).length})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income (Aamdani)
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense (Kharch)
          </button>
        </div>

        {/* Search & Archived Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium border transition-colors cursor-pointer ${
              showArchived
                ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {showArchived ? 'Viewing Archived' : 'View Archived'}
          </button>
        </div>
      </div>

      {/* Categories Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No categories match your filters. Click "+ Add Custom Category" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Category Name</th>
                  <th className="py-2.5 px-4">Urdu Title</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Classification</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-center">Reorder</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCategories.map((cat, idx) => {
                  const txCount = transactions.filter(
                    (t) => t.category === cat.name || t.categoryId === cat.id
                  ).length;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-slate-500 font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-800"
                            style={{ backgroundColor: `${cat.color || '#3B82F6'}20` }}
                          >
                            {renderIcon(cat.icon, cat.color)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{cat.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {txCount} historical transactions
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 font-medium">
                        {cat.urduName || '-'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            cat.type === 'income'
                              ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                              : 'bg-rose-950 border border-rose-800 text-rose-400'
                          }`}
                        >
                          {cat.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            cat.isBusiness
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                              : 'bg-purple-950 text-purple-300 border border-purple-800/60'
                          }`}
                        >
                          {cat.isBusiness ? 'Shop Business' : 'Personal / Zaati'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => toggleCategoryStatus(cat.id)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                            cat.isEnabled
                              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {cat.isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveUp(idx)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            disabled={idx === filteredCategories.length - 1}
                            onClick={() => handleMoveDown(idx)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {cat.isArchived ? (
                            <button
                              onClick={() => unarchiveCategory(cat.id)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-semibold cursor-pointer"
                            >
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEdit(cat)}
                                className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded cursor-pointer"
                                title="Edit Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(cat)}
                                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded cursor-pointer"
                                title="Delete / Archive Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingCategory={editingCategory}
          defaultType={activeTab === 'expense' ? 'expense' : 'income'}
        />
      )}
    </div>
  );
};
