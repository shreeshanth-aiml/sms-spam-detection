import React from 'react';
import { ModelHyperparameters, ModelEvaluationMetrics, TopTermWeight } from '../types';
import { Sliders, RotateCcw, Target, Activity, BarChart2, Zap, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ModelTrainerWorkbenchProps {
  hyperparameters: ModelHyperparameters;
  setHyperparameters: React.Dispatch<React.SetStateAction<ModelHyperparameters>>;
  metrics: ModelEvaluationMetrics;
  onRetrain: () => void;
  topSpamTerms: TopTermWeight[];
  topHamTerms: TopTermWeight[];
}

export const ModelTrainerWorkbench: React.FC<ModelTrainerWorkbenchProps> = ({
  hyperparameters,
  setHyperparameters,
  metrics,
  onRetrain,
  topSpamTerms,
  topHamTerms,
}) => {
  const handleSplitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHyperparameters((prev) => ({ ...prev, trainSplitRatio: parseFloat(e.target.value) }));
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHyperparameters((prev) => ({ ...prev, alpha: parseFloat(e.target.value) }));
  };

  const handleNgramChange = (max: number) => {
    setHyperparameters((prev) => ({ ...prev, ngramMax: max }));
  };

  const handleStopWordsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHyperparameters((prev) => ({ ...prev, useStopWords: e.target.checked }));
  };

  const handleMaxFeaturesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHyperparameters((prev) => ({ ...prev, maxFeatures: parseInt(e.target.value) }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Hyperparameter Tuning & Performance Studio</span>
          </div>
          <h2 className="text-xl font-bold">Multinomial Naive Bayes & TF-IDF Config</h2>
          <p className="text-xs text-slate-400 mt-1">
            Adjust training splits, Laplace smoothing alpha, N-Gram ranges, and observe impact on accuracy and confusion matrix.
          </p>
        </div>

        <button
          onClick={onRetrain}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retrain & Evaluate Model</span>
        </button>
      </div>

      {/* Grid: Hyperparameter Controls + Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Settings */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>Model Parameters</span>
          </h3>

          {/* 1. Train / Test Split */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Train / Test Split Ratio</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                {Math.round(hyperparameters.trainSplitRatio * 100)}% Train / {Math.round((1 - hyperparameters.trainSplitRatio) * 100)}% Test
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="0.9"
              step="0.05"
              value={hyperparameters.trainSplitRatio}
              onChange={handleSplitChange}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>60/40 Split</span>
              <span>80/20 (Default)</span>
              <span>90/10 Split</span>
            </div>
          </div>

          {/* 2. Laplace Smoothing Alpha */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Laplace Smoothing (α)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                α = {hyperparameters.alpha.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={hyperparameters.alpha}
              onChange={handleAlphaChange}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Prevents zero probability for unseen words in test set.
            </p>
          </div>

          {/* 3. N-Gram Range */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              TF-IDF N-Gram Feature Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNgramChange(1)}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition ${
                  hyperparameters.ngramMax === 1
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                (1, 1) Unigrams Only
              </button>
              <button
                onClick={() => handleNgramChange(2)}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition ${
                  hyperparameters.ngramMax === 2
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                (1, 2) Unigrams + Bigrams
              </button>
            </div>
          </div>

          {/* 4. Stop Words & Max Features */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Remove English Stop Words
              </label>
              <input
                type="checkbox"
                checked={hyperparameters.useStopWords}
                onChange={handleStopWordsToggle}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Max Vocabulary Features
              </label>
              <select
                value={hyperparameters.maxFeatures}
                onChange={handleMaxFeaturesChange}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 dark:text-slate-200"
              >
                <option value={1000}>1,000 terms</option>
                <option value={3000}>3,000 terms</option>
                <option value={5000}>5,000 terms</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Score Cards + Confusion Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Accuracy</span>
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">Correct predictions ratio</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Precision</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {(metrics.precision * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">Spam precision rate</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Recall</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {(metrics.recall * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">Spam detection recall</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">F1-Score</span>
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {(metrics.f1Score * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">Harmonic mean</span>
            </div>
          </div>

          {/* Interactive Confusion Matrix Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <span>Confusion Matrix (Test Samples = {metrics.totalTestCount})</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Scikit-Learn Standard Grid</span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {/* True Negatives (Ham -> Ham) */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  True Negative (TN)
                </div>
                <div className="text-3xl font-black my-1">{metrics.confusionMatrix.tn}</div>
                <div className="text-[11px] opacity-80">Actual Ham predicted as Ham</div>
              </div>

              {/* False Positives (Ham -> Spam) */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  False Positive (FP)
                </div>
                <div className="text-3xl font-black my-1">{metrics.confusionMatrix.fp}</div>
                <div className="text-[11px] opacity-80">Actual Ham misclassified as Spam</div>
              </div>

              {/* False Negatives (Spam -> Ham) */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-300">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  False Negative (FN)
                </div>
                <div className="text-3xl font-black my-1">{metrics.confusionMatrix.fn}</div>
                <div className="text-[11px] opacity-80">Actual Spam missed as Ham</div>
              </div>

              {/* True Positives (Spam -> Spam) */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-300">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  True Positive (TP)
                </div>
                <div className="text-3xl font-black my-1">{metrics.confusionMatrix.tp}</div>
                <div className="text-[11px] opacity-80">Actual Spam predicted as Spam</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Keywords / Vocabulary Importance Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Spam Terms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center justify-between">
            <span>🚨 Top Spam Keywords (Log Likelihood Ratio)</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Terms that strongly correlate with Spam classification:</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSpamTerms} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="term" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                  {topSpamTerms.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#f43f5e" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Ham Terms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center justify-between">
            <span>💬 Top Ham Keywords (Legitimate Indicators)</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Terms that strongly correlate with Legitimate Ham messages:</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topHamTerms} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="term" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                  {topHamTerms.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
