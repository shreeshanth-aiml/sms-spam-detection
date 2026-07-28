import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_SMS_DATASET } from './data/initialDataset';
import { ModelHyperparameters, SmsMessage } from './types';
import { LocalTfidfNaiveBayesModel } from './utils/spamModelEngine';
import { generatePythonScript } from './utils/pythonScriptGenerator';
import { Navbar } from './components/Navbar';
import { LivePredictor } from './components/LivePredictor';
import { PythonScriptViewer } from './components/PythonScriptViewer';
import { ModelTrainerWorkbench } from './components/ModelTrainerWorkbench';
import { DatasetExplorer } from './components/DatasetExplorer';
import { MlConceptsGuide } from './components/MlConceptsGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('predictor');
  const [dataset, setDataset] = useState<SmsMessage[]>(INITIAL_SMS_DATASET);

  const [hyperparameters, setHyperparameters] = useState<ModelHyperparameters>({
    trainSplitRatio: 0.8,
    alpha: 1.0,
    ngramMax: 1,
    useStopWords: true,
    maxFeatures: 3000,
  });

  // Train model & compute evaluation metrics whenever dataset or hyperparameters change
  const modelInstance = useMemo(() => {
    const model = new LocalTfidfNaiveBayesModel(hyperparameters);
    const metrics = model.train(dataset);
    return { model, metrics };
  }, [dataset, hyperparameters]);

  // Download spam.csv file
  const handleDownloadCsv = () => {
    const header = 'label,message\n';
    const rows = dataset
      .map((item) => `"${item.label}","${item.message.replace(/"/g, '""')}"`)
      .join('\n');
    const csvContent = header + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'spam.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download sms_spam_detector.py file
  const handleDownloadPython = () => {
    const code = generatePythonScript(hyperparameters);
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sms_spam_detector.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetCount={dataset.length}
        onDownloadCsv={handleDownloadCsv}
        onDownloadPython={handleDownloadPython}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'predictor' && <LivePredictor model={modelInstance.model} />}

        {activeTab === 'python' && (
          <PythonScriptViewer
            hyperparameters={hyperparameters}
            onDownloadPython={handleDownloadPython}
            onDownloadCsv={handleDownloadCsv}
          />
        )}

        {activeTab === 'workbench' && (
          <ModelTrainerWorkbench
            hyperparameters={hyperparameters}
            setHyperparameters={setHyperparameters}
            metrics={modelInstance.metrics}
            onRetrain={() => {}}
            topSpamTerms={modelInstance.model.getTopSpamTerms()}
            topHamTerms={modelInstance.model.getTopHamTerms()}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer
            dataset={dataset}
            setDataset={setDataset}
            onDownloadCsv={handleDownloadCsv}
          />
        )}

        {activeTab === 'guide' && <MlConceptsGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>
          SMS Spam Detection Studio • Built with React, Scikit-Learn & Pandas ML Pipeline • Zero External APIs Required
        </p>
      </footer>
    </div>
  );
}
