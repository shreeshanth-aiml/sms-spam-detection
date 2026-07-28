import React from 'react';
import { BookOpen, Terminal, CheckCircle2, FileText, Brain, Sparkles, Cpu } from 'lucide-react';

export const MlConceptsGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI/ML Student Guide: SMS Spam Detection</h2>
            <p className="text-xs text-slate-300">
              Core Machine Learning concepts behind local Natural Language Processing (NLP) text classification.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 4 Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concept 1: TF-IDF Vectorization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-indigo-500 font-bold text-sm">
            <Brain className="w-5 h-5" />
            <span>1. TF-IDF Text Feature Extraction</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Machine Learning algorithms require numerical vectors. <strong>TF-IDF</strong> (Term Frequency - Inverse Document Frequency) converts raw text into numerical weights:
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1">
            <p><strong>TF(t, d)</strong> = (Count of term t in message d) / (Total terms in d)</p>
            <p><strong>IDF(t)</strong> = ln((1 + N) / (1 + Document Frequency of t)) + 1</p>
            <p className="text-indigo-500 font-bold pt-1">TF-IDF Weight = TF(t, d) × IDF(t)</p>
          </div>
          <p className="text-xs text-slate-500">
            Words that appear frequently in a specific message (e.g., "winner", "claim", "giftcard") but rarely in general text get high TF-IDF scores!
          </p>
        </div>

        {/* Concept 2: Multinomial Naive Bayes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-500 font-bold text-sm">
            <Cpu className="w-5 h-5" />
            <span>2. Multinomial Naive Bayes Classifier</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Multinomial Naive Bayes applies <strong>Bayes' Theorem</strong> assuming feature independence given the class label:
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1">
            <p>P(Spam | Words) ∝ P(Spam) × ∏ P(word_i | Spam)</p>
            <p className="text-emerald-500 font-bold pt-1">
              Laplace Smoothing P(w|c) = (count(w,c) + α) / (total_count(c) + α × |V|)
            </p>
          </div>
          <p className="text-xs text-slate-500">
            The parameter <strong>α (alpha)</strong> prevents zero probability errors when encountering new terms during test time.
          </p>
        </div>

        {/* Concept 3: Confusion Matrix & Metrics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-500 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>3. Model Evaluation Metrics</span>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <li>
              <strong className="text-slate-900 dark:text-slate-100">Accuracy:</strong> Total correct predictions divided by total test set samples.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-100">Precision:</strong> Out of all messages predicted as Spam, how many were actually Spam? (Prevents legitimate emails from being flagged).
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-100">Recall:</strong> Out of all actual Spam messages, how many did the model detect?
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-100">F1-Score:</strong> Harmonic mean of Precision and Recall.
            </li>
          </ul>
        </div>

        {/* Concept 4: Local Terminal Execution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-purple-500 font-bold text-sm">
            <Terminal className="w-5 h-5" />
            <span>4. Local Python Environment Setup</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            To run this project locally on your machine without external cloud APIs:
          </p>

          <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-indigo-300 space-y-1">
            <p className="text-slate-500"># 1. Install required Python packages</p>
            <p>pip install pandas scikit-learn</p>
            <p className="text-slate-500 pt-1"># 2. Save 'spam.csv' and 'sms_spam_detector.py' in same directory</p>
            <p className="text-slate-500"># 3. Run script</p>
            <p>python sms_spam_detector.py</p>
          </div>
        </div>
      </div>
    </div>
  );
};
