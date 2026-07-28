import { ModelHyperparameters } from '../types';

export function generatePythonScript(params: ModelHyperparameters): string {
  const testSize = Math.round((1 - params.trainSplitRatio) * 100) / 100;
  const ngramTuple = params.ngramMax === 2 ? '(1, 2)' : '(1, 1)';
  const stopWordsStr = params.useStopWords ? "'english'" : "None";

  return `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# ==============================================================================
# STEP 1: Load the local dataset
# ==============================================================================
# Assume 'spam.csv' has two columns: 'label' ('spam' or 'ham') and 'message'
print("📂 [Step 1] Loading local dataset 'spam.csv'...")

try:
    # Load dataset using pandas
    df = pd.read_csv('spam.csv')
    
    # Display the first 5 rows to verify the dataset structure
    print("Dataset preview:")
    print(df.head())
    print(f"Total messages loaded: {len(df)}")
    print(f"Label distribution:\\n{df['label'].value_counts()}\\n")

except FileNotFoundError:
    print("❌ Error: 'spam.csv' not found in current directory.")
    print("Please make sure 'spam.csv' is saved in the same folder as this script!")
    exit(1)

# Clean/Ensure labels are lowercased strings
df['label'] = df['label'].str.lower()
X = df['message']  # Text messages (Features)
y = df['label']    # 'spam' or 'ham' (Target labels)

# ==============================================================================
# STEP 2: Split data into Training and Testing sets
# ==============================================================================
# train_test_split randomly partitions the dataset.
# test_size=${testSize} means ${Math.round((1 - testSize) * 100)}% for training and ${Math.round(testSize * 100)}% for testing.
# random_state=42 ensures reproducible results every time you run this script.
print("✂️ [Step 2] Splitting data into training and testing sets...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=${testSize}, 
    random_state=42, 
    stratify=y
)

print(f"Training set size: {len(X_train)} samples")
print(f"Testing set size:  {len(X_test)} samples\\n")

# ==============================================================================
# STEP 3: Convert raw text into numerical TF-IDF features
# ==============================================================================
# Machine Learning models cannot process raw strings directly.
# TfidfVectorizer converts text messages into a matrix of TF-IDF features.
# - stop_words=${stopWordsStr}: Removes common noise words (e.g., 'the', 'is', 'at')
# - ngram_range=${ngramTuple}: Extracts ${params.ngramMax === 2 ? 'unigrams and bigrams' : 'unigrams'}
# - max_features=${params.maxFeatures}: Keeps the top ${params.maxFeatures} most informative vocabulary words
print("🔤 [Step 3] Transforming raw text into TF-IDF numerical vectors...")
vectorizer = TfidfVectorizer(
    stop_words=${stopWordsStr},
    ngram_range=${ngramTuple},
    max_features=${params.maxFeatures},
    lowercase=True
)

# Fit vectorizer on training data and transform train text into vectors
X_train_tfidf = vectorizer.fit_transform(X_train)

# Transform test text into vectors using the ALREADY fitted vectorizer (prevents data leakage)
X_test_tfidf = vectorizer.transform(X_test)

print(f"TF-IDF feature matrix shape: {X_train_tfidf.shape}\\n")

# ==============================================================================
# STEP 4: Train Multinomial Naive Bayes classifier
# ==============================================================================
# MultinomialNB is a classic probabilistic classifier ideal for word count/frequency features.
# alpha=${params.alpha}: Laplace smoothing parameter to handle unseen words.
print("🧠 [Step 4] Training Multinomial Naive Bayes model...")
model = MultinomialNB(alpha=${params.alpha})
model.fit(X_train_tfidf, y_train)
print("✅ Model training complete!\\n")

# ==============================================================================
# STEP 5: Evaluate model performance
# ==============================================================================
print("📊 [Step 5] Evaluating model performance on test set...")
y_pred = model.predict(X_test_tfidf)

# 1. Overall Accuracy
acc = accuracy_score(y_test, y_pred)
print(f"🎯 Model Accuracy: {acc * 100:.2f}%\n")

# 2. Confusion Matrix
# Shows [True Negatives (Ham), False Positives]
#       [False Negatives, True Positives (Spam)]
cm = confusion_matrix(y_test, y_pred, labels=['ham', 'spam'])
print("🧩 Confusion Matrix:")
print("                 Predicted HAM   Predicted SPAM")
print(f"Actual HAM       {cm[0][0]:<15} {cm[0][1]}")
print(f"Actual SPAM      {cm[1][0]:<15} {cm[1][1]}\\n")

# 3. Detailed Precision, Recall, and F1-Score report
print("📋 Detailed Classification Report:")
print(classification_report(y_test, y_pred))

# ==============================================================================
# STEP 6: Custom Message Predictor Function
# ==============================================================================
def predict_sms(custom_message):
    """
    Predicts whether a custom text string is 'Spam' or 'Ham'.
    Includes prediction probability/confidence score.
    """
    # Vectorize the input message using the fitted vectorizer
    message_tfidf = vectorizer.transform([custom_message])
    
    # Predict label and probabilities
    prediction = model.predict(message_tfidf)[0]
    probabilities = model.predict_proba(message_tfidf)[0]
    
    # Map probability to class index (classes_ array holds ['ham', 'spam'])
    spam_idx = list(model.classes_).index('spam')
    spam_prob = probabilities[spam_idx] * 100
    
    print("--------------------------------------------------")
    print(f"💬 Message: \\"{custom_message}\\"")
    print(f"🚨 Prediction: {prediction.upper()}")
    print(f"📈 Spam Confidence: {spam_prob:.1f}%")
    print("--------------------------------------------------\\n")
    
    return prediction

# ==============================================================================
# TEST CUSTOM MESSAGES
# ==============================================================================
if __name__ == '__main__':
    print("🧪 [Step 6] Testing Custom Messages...")
    
    # Test 1: Typical Spam Example
    predict_sms("Win a free iPhone now! Click http://claim-prize.com or text WIN to 88202")
    
    # Test 2: Typical Legitimate (Ham) Example
    predict_sms("Hey, are we still meeting for lunch at 12:30 today?")
    
    # Test 3: Financial Phishing Spam Example
    predict_sms("URGENT: Your bank account has been locked due to suspicious activity. Verify credentials now.")
`;
}
