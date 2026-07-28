import {
  SmsMessage,
  ModelHyperparameters,
  ModelEvaluationMetrics,
  PredictionResult,
  WordContribution,
  TopTermWeight,
  LabelType
} from '../types';

// Standard English stop words
const ENGLISH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Tokenize text into words / n-grams
 */
export function tokenizeText(text: string, useStopWords: boolean, ngramMax: number): string[] {
  // Clean text: lowercasing, replacing URLs with 'http', removing punctuation
  const clean = text.toLowerCase()
    .replace(/https?:\/\/\S+/g, ' http ')
    .replace(/[^\w\s]/g, ' ');

  const rawWords = clean.split(/\s+/).filter(w => w.length > 1 && !/^\d+$/.test(w));

  const filteredWords = useStopWords
    ? rawWords.filter(w => !ENGLISH_STOP_WORDS.has(w))
    : rawWords;

  if (ngramMax === 1) {
    return filteredWords;
  }

  // Generate unigrams + bigrams
  const tokens: string[] = [...filteredWords];
  for (let i = 0; i < filteredWords.length - 1; i++) {
    tokens.push(`${filteredWords[i]} ${filteredWords[i + 1]}`);
  }

  return tokens;
}

export class LocalTfidfNaiveBayesModel {
  private hyperparameters: ModelHyperparameters;
  private vocabulary: Map<string, number> = new Map(); // term -> featureIndex
  private featureNames: string[] = [];
  private idfVector: number[] = [];
  
  // Naive Bayes learned parameters
  private priorSpamLog: number = 0;
  private priorHamLog: number = 0;
  private featureProbSpamLog: number[] = [];
  private featureProbHamLog: number[] = [];

  // Trained vocabulary weights for feature analysis
  private topSpamTerms: TopTermWeight[] = [];
  private topHamTerms: TopTermWeight[] = [];

  constructor(params: ModelHyperparameters) {
    this.hyperparameters = params;
  }

  /**
   * Train the model on given dataset
   */
  public train(dataset: SmsMessage[]): ModelEvaluationMetrics {
    // 1. Shuffle & split dataset into train and test sets deterministically
    const shuffled = [...dataset].sort((a, b) => a.id.localeCompare(b.id));
    const splitIndex = Math.floor(shuffled.length * this.hyperparameters.trainSplitRatio);
    const trainData = shuffled.slice(0, splitIndex);
    const testData = shuffled.slice(splitIndex);

    // 2. Build Vocabulary from training set
    const termDocFreqMap = new Map<string, number>(); // term -> number of docs containing term
    const termTotalFreqMap = new Map<string, number>();

    trainData.forEach(msg => {
      const tokens = tokenizeText(msg.message, this.hyperparameters.useStopWords, this.hyperparameters.ngramMax);
      const uniqueTokensInDoc = new Set(tokens);
      
      uniqueTokensInDoc.forEach(token => {
        termDocFreqMap.set(token, (termDocFreqMap.get(token) || 0) + 1);
      });

      tokens.forEach(token => {
        termTotalFreqMap.set(token, (termTotalFreqMap.get(token) || 0) + 1);
      });
    });

    // Sort terms by document frequency & keep top maxFeatures
    const sortedTerms = Array.from(termDocFreqMap.entries())
      .filter(([term]) => term.length >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.hyperparameters.maxFeatures)
      .map(([term]) => term);

    this.featureNames = sortedTerms;
    this.vocabulary.clear();
    this.featureNames.forEach((term, idx) => {
      this.vocabulary.set(term, idx);
    });

    const N = trainData.length;
    const numFeatures = this.featureNames.length;

    // 3. Compute IDF Vector: IDF(t) = ln((1 + N) / (1 + df(t))) + 1
    this.idfVector = this.featureNames.map(term => {
      const df = termDocFreqMap.get(term) || 0;
      return Math.log((1 + N) / (1 + df)) + 1;
    });

    // 4. Transform train messages to TF-IDF matrix & sum feature values per class
    let spamCount = 0;
    let hamCount = 0;

    const tfidfSumSpam = new Float64Array(numFeatures);
    const tfidfSumHam = new Float64Array(numFeatures);
    let totalTfidfSpam = 0;
    let totalTfidfHam = 0;

    trainData.forEach(msg => {
      const isSpam = msg.label === 'spam';
      if (isSpam) spamCount++;
      else hamCount++;

      const tfidfVec = this.transformToTfidf(msg.message);
      for (let i = 0; i < numFeatures; i++) {
        const val = tfidfVec[i];
        if (val > 0) {
          if (isSpam) {
            tfidfSumSpam[i] += val;
            totalTfidfSpam += val;
          } else {
            tfidfSumHam[i] += val;
            totalTfidfHam += val;
          }
        }
      }
    });

    // 5. Compute Class Prior Log Probabilities
    const totalTrain = trainData.length || 1;
    this.priorSpamLog = Math.log((spamCount + 1) / (totalTrain + 2));
    this.priorHamLog = Math.log((hamCount + 1) / (totalTrain + 2));

    // 6. Compute Feature Conditional Log Probabilities with Laplace Smoothing
    const alpha = this.hyperparameters.alpha;
    const denomSpam = totalTfidfSpam + alpha * numFeatures;
    const denomHam = totalTfidfHam + alpha * numFeatures;

    this.featureProbSpamLog = new Array(numFeatures);
    this.featureProbHamLog = new Array(numFeatures);

    for (let i = 0; i < numFeatures; i++) {
      this.featureProbSpamLog[i] = Math.log((tfidfSumSpam[i] + alpha) / denomSpam);
      this.featureProbHamLog[i] = Math.log((tfidfSumHam[i] + alpha) / denomHam);
    }

    // 7. Calculate top terms for Spam vs Ham by log likelihood ratio
    const termRatios: { term: string; score: number }[] = [];
    for (let i = 0; i < numFeatures; i++) {
      const score = this.featureProbSpamLog[i] - this.featureProbHamLog[i];
      termRatios.push({ term: this.featureNames[i], score });
    }

    termRatios.sort((a, b) => b.score - a.score);

    this.topSpamTerms = termRatios.slice(0, 10).map(item => ({
      term: item.term,
      weight: Math.round(item.score * 100) / 100,
      category: 'spam'
    }));

    this.topHamTerms = [...termRatios].reverse().slice(0, 10).map(item => ({
      term: item.term,
      weight: Math.round(-item.score * 100) / 100,
      category: 'ham'
    }));

    // 8. Evaluate on Test Set
    let tp = 0, fp = 0, tn = 0, fn = 0;

    testData.forEach(testMsg => {
      const pred = this.predict(testMsg.message);
      const actual = testMsg.label;

      if (pred.prediction === 'spam' && actual === 'spam') tp++;
      else if (pred.prediction === 'spam' && actual === 'ham') fp++;
      else if (pred.prediction === 'ham' && actual === 'ham') tn++;
      else if (pred.prediction === 'ham' && actual === 'spam') fn++;
    });

    const totalTest = testData.length || 1;
    const accuracy = (tp + tn) / totalTest;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: { tp, fp, tn, fn },
      totalTrainCount: trainData.length,
      totalTestCount: testData.length,
      spamCountInTrain: spamCount,
      hamCountInTrain: hamCount
    };
  }

  /**
   * Convert text to TF-IDF normalized vector
   */
  private transformToTfidf(text: string): Float64Array {
    const numFeatures = this.featureNames.length;
    const tfidfVec = new Float64Array(numFeatures);
    const tokens = tokenizeText(text, this.hyperparameters.useStopWords, this.hyperparameters.ngramMax);

    if (tokens.length === 0 || numFeatures === 0) return tfidfVec;

    // Count term frequencies (TF)
    const tfMap = new Map<number, number>();
    tokens.forEach(tok => {
      const featureIdx = this.vocabulary.get(tok);
      if (featureIdx !== undefined) {
        tfMap.set(featureIdx, (tfMap.get(featureIdx) || 0) + 1);
      }
    });

    // Compute TF * IDF
    let normSq = 0;
    tfMap.forEach((tf, idx) => {
      const tfidf = (1 + Math.log(tf)) * this.idfVector[idx];
      tfidfVec[idx] = tfidf;
      normSq += tfidf * tfidf;
    });

    // L2 Normalization
    if (normSq > 0) {
      const norm = Math.sqrt(normSq);
      for (let i = 0; i < numFeatures; i++) {
        tfidfVec[i] /= norm;
      }
    }

    return tfidfVec;
  }

  /**
   * Predict whether a custom string is Spam or Ham with word importance breakdown
   */
  public predict(text: string): PredictionResult {
    const numFeatures = this.featureNames.length;
    const tfidfVec = this.transformToTfidf(text);
    const tokens = tokenizeText(text, this.hyperparameters.useStopWords, this.hyperparameters.ngramMax);

    let logLikelihoodSpam = this.priorSpamLog;
    let logLikelihoodHam = this.priorHamLog;

    const contributions: WordContribution[] = [];

    // Unique tokens present in input
    const uniqueTokens = Array.from(new Set(tokens));

    uniqueTokens.forEach(token => {
      const featureIdx = this.vocabulary.get(token);
      let tfidfWeight = 0;
      let spamLog = 0;
      let hamLog = 0;
      let impact: 'spam' | 'ham' | 'neutral' = 'neutral';

      if (featureIdx !== undefined) {
        tfidfWeight = tfidfVec[featureIdx];
        spamLog = this.featureProbSpamLog[featureIdx];
        hamLog = this.featureProbHamLog[featureIdx];

        const logDiff = spamLog - hamLog;
        if (logDiff > 0.3) impact = 'spam';
        else if (logDiff < -0.3) impact = 'ham';
      }

      contributions.push({
        word: token,
        tfidfWeight: Math.round(tfidfWeight * 1000) / 1000,
        spamLikelihoodLog: Math.round(spamLog * 100) / 100,
        hamLikelihoodLog: Math.round(hamLog * 100) / 100,
        impact
      });
    });

    for (let i = 0; i < numFeatures; i++) {
      const val = tfidfVec[i];
      if (val > 0) {
        logLikelihoodSpam += val * this.featureProbSpamLog[i];
        logLikelihoodHam += val * this.featureProbHamLog[i];
      }
    }

    // Convert Log Likelihoods to Probabilities using Log-Sum-Exp Trick
    const maxLog = Math.max(logLikelihoodSpam, logLikelihoodHam);
    const expSpam = Math.exp(logLikelihoodSpam - maxLog);
    const expHam = Math.exp(logLikelihoodHam - maxLog);
    const sumExp = expSpam + expHam;

    const spamProbability = expSpam / sumExp;
    const hamProbability = expHam / sumExp;

    const prediction: LabelType = spamProbability >= 0.5 ? 'spam' : 'ham';

    return {
      prediction,
      spamProbability: Math.round(spamProbability * 1000) / 1000,
      hamProbability: Math.round(hamProbability * 1000) / 1000,
      wordContributions: contributions.sort((a, b) => Math.abs(b.spamLikelihoodLog - b.hamLikelihoodLog) - Math.abs(a.spamLikelihoodLog - a.hamLikelihoodLog))
    };
  }

  public getTopSpamTerms(): TopTermWeight[] {
    return this.topSpamTerms;
  }

  public getTopHamTerms(): TopTermWeight[] {
    return this.topHamTerms;
  }
}
