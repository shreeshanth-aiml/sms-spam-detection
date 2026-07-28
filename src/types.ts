export type LabelType = 'spam' | 'ham';

export interface SmsMessage {
  id: string;
  label: LabelType;
  message: string;
}

export interface ModelHyperparameters {
  trainSplitRatio: number; // e.g. 0.8
  alpha: number; // Naive Bayes smoothing, e.g., 1.0
  ngramMax: number; // 1 for unigram, 2 for unigram+bigram
  useStopWords: boolean;
  maxFeatures: number;
}

export interface ConfusionMatrixData {
  tp: number; // True Positives (Spam predicted as Spam)
  fp: number; // False Positives (Ham predicted as Spam)
  tn: number; // True Negatives (Ham predicted as Ham)
  fn: number; // False Negatives (Spam predicted as Ham)
}

export interface ModelEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: ConfusionMatrixData;
  totalTrainCount: number;
  totalTestCount: number;
  spamCountInTrain: number;
  hamCountInTrain: number;
}

export interface WordContribution {
  word: string;
  tfidfWeight: number;
  spamLikelihoodLog: number;
  hamLikelihoodLog: number;
  impact: 'spam' | 'ham' | 'neutral';
}

export interface PredictionResult {
  prediction: LabelType;
  spamProbability: number;
  hamProbability: number;
  wordContributions: WordContribution[];
}

export interface TopTermWeight {
  term: string;
  weight: number;
  category: LabelType;
}
