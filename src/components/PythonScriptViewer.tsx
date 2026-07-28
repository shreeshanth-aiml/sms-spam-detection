import React, { useState } from 'react';
import { generatePythonScript } from '../utils/pythonScriptGenerator';
import { ModelHyperparameters } from '../types';
import { Copy, Check, Download, FileCode, Terminal, Layers, Sparkles, BookOpen } from 'lucide-react';

interface PythonScriptViewerProps {
  hyperparameters: ModelHyperparameters;
  onDownloadPython: () => void;
  onDownloadCsv: () => void;
}

export const PythonScriptViewer: React.FC<PythonScriptViewerProps> = ({
  hyperparameters,
  onDownloadPython,
  onDownloadCsv,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const pythonScript = generatePythonScript(hyperparameters);

  const rawUserPrompt = `Act as an expert Machine Learning Engineer. I am an AI/ML engineering student and I want to build a local SMS Spam Detection project in Python. 

I do NOT want to use any external APIs (like OpenAI, Gemini, or Claude). I want to train my own model locally.

Please write a complete, beginner-friendly Python script using pandas and scikit-learn that does the following:
1. Loads a local dataset (assume I have a file named 'spam.csv' with columns 'label' and 'message').
2. Splits the data into training and testing sets.
3. Converts the raw text messages into numerical features using TfidfVectorizer.
4. Trains a Multinomial Naive Bayes (MultinomialNB) classifier.
5. Prints out the model's accuracy and a confusion matrix.
6. Includes a simple function at the bottom where I can input a custom string (e.g., "Win a free iPhone now!") to test if the model predicts 'Spam' or 'Ham'.

Add clear comments explaining what each step does so I can understand the workflow.`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(rawUserPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const workflowSteps = [
    {
      step: 1,
      title: '1. Load Local Dataset',
      codeSnippet: `df = pd.read_csv('spam.csv')`,
      desc: 'Reads the CSV file containing "label" (spam/ham) and "message" (text) columns using Pandas dataframe.',
      color: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
    },
    {
      step: 2,
      title: '2. Train / Test Split',
      codeSnippet: `X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)`,
      desc: 'Splits dataset into 80% training data and 20% testing data to prevent overfitting.',
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    },
    {
      step: 3,
      title: '3. TF-IDF Vectorization',
      codeSnippet: `vectorizer = TfidfVectorizer(stop_words='english', max_features=3000)`,
      desc: 'Converts raw string messages into numerical term-frequency inverse document frequency vectors.',
      color: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
    },
    {
      step: 4,
      title: '4. Multinomial Naive Bayes',
      codeSnippet: `model = MultinomialNB(alpha=1.0)\nmodel.fit(X_train_tfidf, y_train)`,
      desc: 'Trains a probabilistic Bayes model ideal for word occurrence and frequency feature matrices.',
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
    },
    {
      step: 5,
      title: '5. Accuracy & Confusion Matrix',
      codeSnippet: `print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")\nprint(confusion_matrix(y_test, y_pred))`,
      desc: 'Evaluates test accuracy and outputs true positive, false positive, true negative, false negative grid.',
      color: 'border-rose-500/30 text-rose-400 bg-rose-500/10'
    },
    {
      step: 6,
      title: '6. Custom Predictor Function',
      codeSnippet: `def predict_sms(message):\n    vec = vectorizer.transform([message])\n    return model.predict(vec)[0]`,
      desc: 'Takes any custom SMS text string, vectorizes it, and outputs Spam or Ham prediction.',
      color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <FileCode className="w-4 h-4" />
            <span>Complete Local Python Script</span>
          </div>
          <h2 className="text-xl font-bold">`sms_spam_detector.py`</h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero API dependencies • Pure local execution using Scikit-Learn and Pandas • Production clean with comments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
          </button>

          <button
            onClick={onDownloadPython}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download .py File</span>
          </button>

          <button
            onClick={onDownloadCsv}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Dataset (spam.csv)</span>
          </button>
        </div>
      </div>

      {/* Step-by-step Workflow Summary Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2 mb-3">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Machine Learning Pipeline Steps Included</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps.map((s) => (
            <div
              key={s.step}
              onClick={() => setActiveStep(activeStep === s.step ? null : s.step)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeStep === s.step
                  ? 'bg-indigo-900/30 border-indigo-500/60 ring-2 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${s.color}`}>
                  Step {s.step}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Scikit-Learn</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{s.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{s.desc}</p>
              <pre className="p-2 bg-slate-900 text-indigo-300 rounded-lg text-[11px] font-mono overflow-x-auto">
                <code>{s.codeSnippet}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 font-mono">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200 font-bold">sms_spam_detector.py</span>
            <span className="text-slate-500">({pythonScript.split('\n').length} lines)</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Python 3.8+
            </span>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded transition text-xs font-medium"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-6 text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto max-h-[600px]">
          <code>{pythonScript}</code>
        </pre>
      </div>

      {/* Antigravity AI Prompt Template Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Antigravity AI Agent Prompt Template
            </h3>
          </div>
          <button
            onClick={handleCopyPrompt}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg transition"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy Prompt'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          You can copy this exact prompt and pass it into any AI Coding Agent or LLM to regenerate or customize this local Machine Learning script:
        </p>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {rawUserPrompt}
        </div>
      </div>
    </div>
  );
};
