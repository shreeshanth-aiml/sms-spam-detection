import React, { useState } from 'react';
import { SmsMessage, LabelType } from '../types';
import { Database, Search, Plus, Trash2, Download, Filter, FileText } from 'lucide-react';

interface DatasetExplorerProps {
  dataset: SmsMessage[];
  setDataset: React.Dispatch<React.SetStateAction<SmsMessage[]>>;
  onDownloadCsv: () => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  dataset,
  setDataset,
  onDownloadCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [labelFilter, setLabelFilter] = useState<'all' | LabelType>('all');

  // New message form state
  const [newMessageText, setNewMessageText] = useState('');
  const [newLabel, setNewLabel] = useState<LabelType>('spam');
  const [isAdding, setIsAdding] = useState(false);

  const filteredDataset = dataset.filter((item) => {
    const matchesSearch = item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLabel = labelFilter === 'all' || item.label === labelFilter;
    return matchesSearch && matchesLabel;
  });

  const spamCount = dataset.filter((d) => d.label === 'spam').length;
  const hamCount = dataset.filter((d) => d.label === 'ham').length;

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newItem: SmsMessage = {
      id: `custom_${Date.now()}`,
      label: newLabel,
      message: newMessageText.trim(),
    };

    setDataset((prev) => [newItem, ...prev]);
    setNewMessageText('');
    setIsAdding(false);
  };

  const handleDeleteMessage = (id: string) => {
    setDataset((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Dataset Statistics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Local Dataset Explorer</span>
          </div>
          <h2 className="text-xl font-bold">`spam.csv` Data Table</h2>
          <p className="text-xs text-slate-400 mt-1">
            Inspect raw text samples, add custom training messages, and export updated CSV.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom SMS</span>
          </button>

          <button
            onClick={onDownloadCsv}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>Export spam.csv</span>
          </button>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase block">Total Messages</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{dataset.length}</span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-500 uppercase block">Spam Messages</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {spamCount} <span className="text-xs font-normal opacity-70">({((spamCount / (dataset.length || 1)) * 100).toFixed(0)}%)</span>
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
            🚨
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-500 uppercase block">Ham Messages</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {hamCount} <span className="text-xs font-normal opacity-70">({((hamCount / (dataset.length || 1)) * 100).toFixed(0)}%)</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            💬
          </div>
        </div>
      </div>

      {/* Add New Message Modal / Drawer */}
      {isAdding && (
        <form onSubmit={handleAddMessage} className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-indigo-300">Add New SMS Message to Dataset</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Label</label>
              <select
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value as LabelType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="spam">🚨 SPAM</option>
                <option value="ham">💬 HAM (Legitimate)</option>
              </select>
            </div>

            <div className="md:col-span-9">
              <label className="block text-xs font-semibold text-slate-300 mb-1">SMS Message Text</label>
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type new message text here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
            >
              Save to Dataset
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search messages by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setLabelFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                labelFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All ({dataset.length})
            </button>
            <button
              onClick={() => setLabelFilter('spam')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                labelFilter === 'spam'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Spam ({spamCount})
            </button>
            <button
              onClick={() => setLabelFilter('ham')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                labelFilter === 'ham'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Ham ({hamCount})
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-4 w-16">#</th>
                <th className="py-3 px-4 w-28">Label</th>
                <th className="py-3 px-4">Message Content</th>
                <th className="py-3 px-4 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredDataset.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                    No messages match your search filter.
                  </td>
                </tr>
              ) : (
                filteredDataset.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          item.label === 'spam'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {item.label === 'spam' ? '🚨 SPAM' : '💬 HAM'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-mono leading-relaxed">
                      {item.message}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteMessage(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
