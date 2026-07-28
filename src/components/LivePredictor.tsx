import React, { useState } from 'react';
import { LocalTfidfNaiveBayesModel } from '../utils/spamModelEngine';
import { PredictionResult } from '../types';
import { Send, Sparkles, ShieldAlert, ShieldCheck, Info, RefreshCw, Zap } from 'lucide-react';

interface LivePredictorProps {
  model: LocalTfidfNaiveBayesModel;
}

const PRESET_EXAMPLES = [
  {
    title: 'Phishing Prize Spam',
    text: 'CONGRATULATIONS! You won a $1,000 Walmart gift card! Click http://bit.ly/claim-gift now to collect your reward.',
    type: 'spam'
  },
  {
    title: 'Legitimate Casual Message',
    text: 'Hey mom, I finished my machine learning assignment and I am heading back home now. See you soon!',
    type: 'ham'
  },
  {
    title: 'Bank Security Scam',
    text: 'URGENT: Your bank account has been suspended due to suspicious activity. Verify details at http://secure-bank-login.net',
    type: 'spam'
  },
  {
    title: '2FA Verification Code',
    text: 'Your verification code is 482910. It expires in 10 minutes. Do not share this code with anyone.',
    type: 'ham'
  },
  {
    title: 'Crypto / Fast Money Scam',
    text: 'Earn $500 per day working from home with automated AI trading! Text WORK to 44321 immediately.',
    type: 'spam'
  }
];

export const LivePredictor: React.FC<LivePredictorProps> = ({ model }) => {
  const [inputText, setInputText] = useState(PRESET_EXAMPLES[0].text);
  const [prediction, setPrediction] = useState<PredictionResult>(() => model.predict(PRESET_EXAMPLES[0].text));

  const handlePredict = (textToPredict: string) => {
    setInputText(textToPredict);
    const result = model.predict(textToPredict);
    setPrediction(result);
  };

  const isSpam = prediction.prediction === 'spam';

  return (
    <div className="space-y-6">
      {/* Top Banner / Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Interactive SMS Spam Predictor</h2>
            <p className="text-xs text-slate-300">
              Type or paste any SMS text to see live classification powered by TF-IDF & Multinomial Naive Bayes.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Try Preset Test Examples:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_EXAMPLES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePredict(preset.text)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center space-x-1.5 ${
                  preset.type === 'spam'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                <span>{preset.type === 'spam' ? '🚨' : '💬'}</span>
                <span>{preset.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Input & Prediction Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Text Input Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              SMS Message Text:
            </label>
            <div className="relative">
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => handlePredict(e.target.value)}
                placeholder="Paste or type an SMS message here (e.g. Win a free gift card now!)..."
                className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono"
              />
              <span className="absolute bottom-3 right-3 text-xs text-slate-400">
                {inputText.length} chars
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => handlePredict(inputText)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              <Send className="w-4 h-4" />
              <span>Analyze Message</span>
            </button>

            <button
              onClick={() => handlePredict('')}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Input</span>
            </button>
          </div>
        </div>

        {/* Right: Prediction Badge & Confidence Gauge */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Classification Result
              </span>
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Multinomial NB Model</span>
              </span>
            </div>

            {/* Big Prediction Badge */}
            <div
              className={`p-5 rounded-2xl border flex items-center space-x-4 mb-6 transition-all ${
                isSpam
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                  isSpam ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                }`}
              >
                {isSpam ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  Predicted Label
                </span>
                <span className="text-2xl font-black uppercase tracking-tight">
                  {isSpam ? 'SPAM 🚨' : 'HAM (Legitimate) 💬'}
                </span>
                <p className="text-xs mt-0.5 opacity-90">
                  {isSpam
                    ? 'High likelihood of promotional, scam, or spam intent.'
                    : 'Classified as normal legitimate personal or transactional message.'}
                </p>
              </div>
            </div>

            {/* Probability Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-600 dark:text-rose-400">Spam Probability</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {(prediction.spamProbability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, prediction.spamProbability * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Ham Probability</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {(prediction.hamProbability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, prediction.hamProbability * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>TF-IDF Token Count: {prediction.wordContributions.length}</span>
            <span>Decision Boundary: 50%</span>
          </div>
        </div>
      </div>

      {/* Feature Explainability & Word-Level Highlight Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Word-Level Feature Contribution & Explainability
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          The model evaluates individual TF-IDF term weights and log conditional probabilities to calculate the final Spam score:
        </p>

        {/* Word Chips */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
          {prediction.wordContributions.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No recognizable vocabulary tokens found in message.</span>
          ) : (
            prediction.wordContributions.map((wc, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition ${
                  wc.impact === 'spam'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : wc.impact === 'ham'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                <span>{wc.word}</span>
                <span className="text-[10px] opacity-75 font-sans">
                  {wc.impact === 'spam' ? '🚨 +Spam' : wc.impact === 'ham' ? '💬 +Ham' : '• neutral'}
                </span>
              </span>
            ))
          )}
        </div>

        {/* Breakdown Table */}
        {prediction.wordContributions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Token / N-Gram</th>
                  <th className="py-2 px-3 font-semibold">TF-IDF Weight</th>
                  <th className="py-2 px-3 font-semibold">Log P(Word|Spam)</th>
                  <th className="py-2 px-3 font-semibold">Log P(Word|Ham)</th>
                  <th className="py-2 px-3 font-semibold">Influence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {prediction.wordContributions.slice(0, 8).map((wc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-mono">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{wc.word}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{wc.tfidfWeight.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-semibold">{wc.spamLikelihoodLog}</td>
                    <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">{wc.hamLikelihoodLog}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold">
                      {wc.impact === 'spam' && <span className="text-rose-500">Pushes Spam</span>}
                      {wc.impact === 'ham' && <span className="text-emerald-500">Pushes Ham</span>}
                      {wc.impact === 'neutral' && <span className="text-slate-400">Neutral</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
