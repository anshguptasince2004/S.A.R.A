# # import matplotlib
# # matplotlib.use("Agg")
# # import pandas as pd
# # import os
# # import re
# # import string
# # import pickle
# # import nltk
# # from tensorflow.keras.layers import Layer
# # import tensorflow as tf
# # import keras
# # from nltk.corpus import stopwords
# # from nltk.stem import WordNetLemmatizer
# # import matplotlib.pyplot as plt
# # from wordcloud import WordCloud
# # from tensorflow.keras.models import load_model
# # from tensorflow.keras.preprocessing.sequence import pad_sequences
# # from collections import Counter

# # nltk.download('stopwords')
# # nltk.download('wordnet')

# # english_stopwords = set(stopwords.words('english'))
# # hinglish_stopwords = set([
# #     "hai", "tha", "thi", "the", "aur", "kyunki", "phir", "yeh", "voh", "par", "mein"
# # ])
# # lemmatizer = WordNetLemmatizer()

# # #cleaning the data
# # def remove_urls_mentions_hashtags(text):
# #     text = re.sub(r"http\S+|www\S+|https\S+", "", text)
# #     text = re.sub(r"@\w+|#\w+", "", text)
# #     return text

# # def remove_punctuation(text):
# #     return text.translate(str.maketrans("", "", string.punctuation))

# # def clean_tweet(text):
# #     if pd.isnull(text):
# #         return ""
# #     text = text.lower()
# #     text = remove_urls_mentions_hashtags(text)
# #     text = remove_punctuation(text)
# #     tokens = text.split()
# #     tokens = [t for t in tokens if t not in english_stopwords and t not in hinglish_stopwords]
# #     tokens = [lemmatizer.lemmatize(t) for t in tokens]
# #     return " ".join(tokens).strip()

# # @keras.saving.register_keras_serializable()
# # class AttentionLayer(Layer):
# #     def __init__(self, **kwargs):
# #         super(AttentionLayer, self).__init__(**kwargs)

# #     def build(self, input_shape):
# #         self.W = self.add_weight(
# #             name="attention_weight",
# #             shape=(input_shape[-1], 1),
# #             initializer="random_normal",
# #             trainable=True
# #         )
# #         self.b = self.add_weight(
# #             name="attention_bias",
# #             shape=(input_shape[1], 1),
# #             initializer="zeros",
# #             trainable=True
# #         )
# #         super(AttentionLayer, self).build(input_shape)

# #     def call(self, inputs):
# #         # Compute attention scores
# #         e = tf.keras.backend.tanh(tf.keras.backend.dot(inputs, self.W) + self.b)
# #         a = tf.keras.backend.softmax(e, axis=1)

# #         # Apply attention scores
# #         output = inputs * a
# #         return tf.reduce_sum(output, axis=1)

# #     def get_config(self):
# #         config = super(AttentionLayer, self).get_config()
# #         return config
# # # Load Model & Tokenizer
# # print("Loading model and tokenizer...")
# # model = load_model(
# #     "sentiment_model_final.keras",
# #     custom_objects={"AttentionLayer": AttentionLayer}
# # )

# # with open("tokenizer.pkl", "rb") as f:
# #     tokenizer = pickle.load(f)


# # MAXLEN = 50
# # BATCH_SIZE = 128

# # # WordCloud Function
# # def generate_wordcloud(data, title, filename):
# #     if len(data) == 0:
# #         print(f"⚠ No data for {title}, skipping WordCloud.")
# #         return
# #     text = " ".join(data)
# #     wc = WordCloud(width=800, height=400, background_color="white").generate(text)
# #     plt.figure(figsize=(8,4))
# #     plt.imshow(wc, interpolation="bilinear")
# #     plt.axis("off")
# #     plt.title(title)
# #     plt.savefig(filename)
# #     plt.close()

# # # Template-Based Summary Generator
# # def generate_template_summary(data, sentiment_name, total_count, amendment_name, top_n=3):
# #     all_text = " ".join(data)
# #     words = [w for w in all_text.split() if w not in english_stopwords and w not in hinglish_stopwords]

# #     if not words:
# #         return f"Analysis of {total_count} comments provides limited insight into public perception of {amendment_name}. No strong themes emerged."

# #     word_counts = Counter(words)
# #     themes = [w for w, _ in word_counts.most_common(top_n)]
# #     theme_str = '", "'.join(themes[:top_n])

# #     if sentiment_name == "Positive":
# #         return (f"AI-Generated Summary\n"
# #                 f"Analysis of {total_count} comments indicates that {amendment_name} is met with strong public approval, "
# #                 f"primarily driven by its perceived positive impacts. Key themes include \"{theme_str}.\" "
# #                 f"Negative feedback is minimal and scattered, lacking a cohesive counter-narrative.")
    
# #     elif sentiment_name == "Negative":
# #         return (f"AI-Generated Summary\n"
# #                 f"Analysis of {total_count} comments indicates that {amendment_name} faces significant public opposition, "
# #                 f"largely due to concerns around negative impacts. Common themes include \"{theme_str}.\" "
# #                 f"While some supportive views exist, they are limited and do not form a strong counterpoint to the prevailing criticism.")
    
# #     elif sentiment_name == "Neutral":
# #         return (f"AI-Generated Summary\n"
# #                 f"Analysis of {total_count} comments shows a mixed public response to {amendment_name}. "
# #                 f"Supporters highlight positive aspects, while critics emphasize negative aspects. "
# #                 f"Key themes include \"{theme_str}.\" Overall, opinions are balanced, with no clear dominant narrative emerging.")
    
# #     else:
# #         return (f"AI-Generated Summary\n"
# #                 f"Analysis of {total_count} comments provides insight into public perception of {amendment_name}. "
# #                 f"Key themes include \"{theme_str}.\" Overall sentiment varies, with both positive and negative viewpoints contributing to the broader discussion.")

# # # Inference Pipeline
# # def run_inference(input_csv, output_csv):
# #     print(f"Loading data from {input_csv}...")
# #     df = pd.read_csv(input_csv)

# #     amendment_name = os.path.splitext(os.path.basename(input_csv))[0].replace("_", " ").title()

# #     if 'label' not in df.columns:
# #         df['label'] = -1

# #     if 'Comment' in df.columns:
# #         df = df.rename(columns={'Comment': 'tweet'})
# #     if 'tweet' not in df.columns:
# #         raise ValueError("Input CSV must have a 'tweet' column")

# #     print("Cleaning tweets...")
# #     df['clean_tweet'] = df['tweet'].apply(clean_tweet)

# #     print("Tokenizing and padding sequences...")
# #     sequences = tokenizer.texts_to_sequences(df['clean_tweet'])
# #     X = pad_sequences(sequences, maxlen=MAXLEN)

# #     empty_count = sum(len(seq)==0 for seq in sequences)
# #     print(f"Empty sequences after tokenization: {empty_count} / {len(df)}")

# #     print("Running model predictions...")
# #     pred_probs = model.predict(X, batch_size=BATCH_SIZE, verbose=1)
# #     df['label'] = pred_probs.argmax(axis=1)
# #     df['sentiment'] = df['label'].map({0:"Negative",1:"Neutral",2:"Positive"})

# #     # Save labeled CSV
# #     df.to_csv(output_csv, index=False, encoding='utf-8')
# #     print(f"✅ Predictions saved to {output_csv}")

# #     counts = df['label'].value_counts().to_dict()
# #     print("\nSentiment Counts:")
# #     print(f"Negative: {counts.get(0,0)}, Neutral: {counts.get(1,0)}, Positive: {counts.get(2,0)}")

# #     # Generate WordClouds inside outputs/
# #     output_dir = os.path.dirname(output_csv)
# #     print("Generating WordClouds...")
# #     generate_wordcloud(df[df['label']==0]['clean_tweet'], "Negative WordCloud", os.path.join(output_dir, "negative_wc.png"))
# #     generate_wordcloud(df[df['label']==1]['clean_tweet'], "Neutral WordCloud", os.path.join(output_dir, "neutral_wc.png"))
# #     generate_wordcloud(df[df['label']==2]['clean_tweet'], "Positive WordCloud", os.path.join(output_dir, "positive_wc.png"))
# #     print("✅ Word clouds saved inside outputs/")

# #     # Summaries
# #     print("\nGenerating AI-Generated Summaries...")
# #     negative_summary = generate_template_summary(df[df['label']==0]['clean_tweet'], "Negative", counts.get(0,0), amendment_name)
# #     neutral_summary  = generate_template_summary(df[df['label']==1]['clean_tweet'], "Neutral", counts.get(1,0), amendment_name)
# #     positive_summary = generate_template_summary(df[df['label']==2]['clean_tweet'], "Positive", counts.get(2,0), amendment_name)

# #     print("\n📄 AI-Generated Summaries:")
# #     print(negative_summary)
# #     print(neutral_summary)
# #     print(positive_summary)

# #     return {
# #         "negative": negative_summary,
# #         "neutral": neutral_summary,
# #         "positive": positive_summary
# #     }

# # if __name__ == "__main__":
# #     run_inference("uploads/AmendmentCombinedIncreased.csv", "outputs/predicted_tweets.csv")








# import matplotlib
# matplotlib.use("Agg")  # Use non-GUI backend for servers

# import os
# import re
# import string
# import pickle
# import pandas as pd
# import nltk
# from nltk.corpus import stopwords
# from nltk.stem import WordNetLemmatizer
# import matplotlib.pyplot as plt
# from wordcloud import WordCloud
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing.sequence import pad_sequences
# from tensorflow.keras.layers import Layer
# import tensorflow as tf
# import keras
# from collections import Counter

# # ---------------- Ensure NLTK Data ----------------
# for pkg in ["stopwords", "wordnet", "omw-1.4"]:
#     try:
#         nltk.data.find(f"corpora/{pkg}")
#     except LookupError:
#         nltk.download(pkg)

# english_stopwords = set(stopwords.words("english"))
# hinglish_stopwords = {"hai", "tha", "thi", "the", "aur", "kyunki", "phir", "yeh", "voh", "par", "mein"}
# lemmatizer = WordNetLemmatizer()

# # ---------------- Text Cleaning ----------------
# def remove_urls_mentions_hashtags(text):
#     text = re.sub(r"http\S+|www\S+|https\S+", "", text)
#     text = re.sub(r"@\w+|#\w+", "", text)
#     return text

# def remove_punctuation(text):
#     return text.translate(str.maketrans("", "", string.punctuation))

# def clean_tweet(text):
#     if pd.isnull(text):
#         return ""
#     text = text.lower()
#     text = remove_urls_mentions_hashtags(text)
#     text = remove_punctuation(text)
#     tokens = text.split()
#     tokens = [t for t in tokens if t not in english_stopwords and t not in hinglish_stopwords]
#     tokens = [lemmatizer.lemmatize(t) for t in tokens]
#     return " ".join(tokens).strip()

# # ---------------- Custom Attention Layer ----------------
# @keras.saving.register_keras_serializable()
# class AttentionLayer(Layer):
#     def __init__(self, **kwargs):
#         super(AttentionLayer, self).__init__(**kwargs)

#     def build(self, input_shape):
#         self.W = self.add_weight(
#             name="attention_weight",
#             shape=(input_shape[-1], 1),
#             initializer="random_normal",
#             trainable=True
#         )
#         self.b = self.add_weight(
#             name="attention_bias",
#             shape=(input_shape[1], 1),
#             initializer="zeros",
#             trainable=True
#         )
#         super(AttentionLayer, self).build(input_shape)

#     def call(self, inputs):
#         e = tf.keras.backend.tanh(tf.keras.backend.dot(inputs, self.W) + self.b)
#         a = tf.keras.backend.softmax(e, axis=1)
#         output = inputs * a
#         return tf.reduce_sum(output, axis=1)

#     def get_config(self):
#         config = super(AttentionLayer, self).get_config()
#         return config

# # ---------------- Load Model & Tokenizer ----------------
# BASE_DIR = os.path.dirname(__file__)
# MODEL_PATH = os.path.join(BASE_DIR, "sentiment_model_final.keras")
# TOKENIZER_PATH = os.path.join(BASE_DIR, "tokenizer.pkl")

# print("Loading model and tokenizer...")
# model = load_model(MODEL_PATH, custom_objects={"AttentionLayer": AttentionLayer})
# with open(TOKENIZER_PATH, "rb") as f:
#     tokenizer = pickle.load(f)

# MAXLEN = 50
# BATCH_SIZE = 128

# # ---------------- WordCloud ----------------
# def generate_wordcloud(data, title, filename):
#     if len(data) == 0:
#         print(f"⚠ No data for {title}, skipping WordCloud.")
#         return
#     text = " ".join(data)
#     wc = WordCloud(width=800, height=400, background_color="white").generate(text)
#     plt.figure(figsize=(8, 4))
#     plt.imshow(wc, interpolation="bilinear")
#     plt.axis("off")
#     plt.title(title)
#     plt.savefig(filename)
#     plt.close()

# # ---------------- Summaries ----------------
# def generate_template_summary(data, sentiment_name, total_count, amendment_name, top_n=3):
#     all_text = " ".join(data)
#     words = [w for w in all_text.split() if w not in english_stopwords and w not in hinglish_stopwords]

#     if not words:
#         return f"Analysis of {total_count} comments provides limited insight into public perception of {amendment_name}. No strong themes emerged."

#     word_counts = Counter(words)
#     themes = [w for w, _ in word_counts.most_common(top_n)]
#     theme_str = '", "'.join(themes[:top_n])

#     if sentiment_name == "Positive":
#         return (f"AI-Generated Summary\n"
#                 f"Analysis of {total_count} comments indicates that {amendment_name} is met with strong public approval, "
#                 f"primarily driven by its perceived positive impacts. Key themes include \"{theme_str}.\" "
#                 f"Negative feedback is minimal and scattered, lacking a cohesive counter-narrative.")
#     elif sentiment_name == "Negative":
#         return (f"AI-Generated Summary\n"
#                 f"Analysis of {total_count} comments indicates that {amendment_name} faces significant public opposition, "
#                 f"largely due to concerns around negative impacts. Common themes include \"{theme_str}.\" "
#                 f"While some supportive views exist, they are limited and do not form a strong counterpoint to the prevailing criticism.")
#     elif sentiment_name == "Neutral":
#         return (f"AI-Generated Summary\n"
#                 f"Analysis of {total_count} comments shows a mixed public response to {amendment_name}. "
#                 f"Supporters highlight positive aspects, while critics emphasize negative aspects. "
#                 f"Key themes include \"{theme_str}.\" Overall, opinions are balanced, with no clear dominant narrative emerging.")
#     else:
#         return (f"AI-Generated Summary\n"
#                 f"Analysis of {total_count} comments provides insight into public perception of {amendment_name}. "
#                 f"Key themes include \"{theme_str}.\" Overall sentiment varies, with both positive and negative viewpoints contributing to the broader discussion.")

# # ---------------- Inference Pipeline ----------------
# def run_inference(input_csv, output_csv):
#     try:
#         print(f"Loading data from {input_csv}...")
#         df = pd.read_csv(input_csv)

#         amendment_name = os.path.splitext(os.path.basename(input_csv))[0].replace("_", " ").title()

#         if "label" not in df.columns:
#             df["label"] = -1

#         if "Comment" in df.columns:
#             df = df.rename(columns={"Comment": "tweet"})
#         if "tweet" not in df.columns:
#             raise ValueError("Input CSV must have a 'tweet' or 'Comment' column")

#         print("Cleaning tweets...")
#         df["clean_tweet"] = df["tweet"].apply(clean_tweet)

#         print("Tokenizing and padding sequences...")
#         sequences = tokenizer.texts_to_sequences(df["clean_tweet"])
#         X = pad_sequences(sequences, maxlen=MAXLEN)

#         empty_count = sum(len(seq) == 0 for seq in sequences)
#         print(f"Empty sequences after tokenization: {empty_count} / {len(df)}")

#         print("Running model predictions...")
#         pred_probs = model.predict(X, batch_size=BATCH_SIZE, verbose=1)
#         df["label"] = pred_probs.argmax(axis=1)
#         df["sentiment"] = df["label"].map({0: "Negative", 1: "Neutral", 2: "Positive"})

#         # Save labeled CSV
#         df.to_csv(output_csv, index=False, encoding="utf-8")
#         print(f"✅ Predictions saved to {output_csv}")

#         counts = df["label"].value_counts().to_dict()
#         print("\nSentiment Counts:")
#         print(f"Negative: {counts.get(0,0)}, Neutral: {counts.get(1,0)}, Positive: {counts.get(2,0)}")

#         # Generate WordClouds
#         output_dir = os.path.dirname(output_csv)
#         print("Generating WordClouds...")
#         generate_wordcloud(df[df["label"] == 0]["clean_tweet"], "Negative WordCloud", os.path.join(output_dir, "negative_wc.png"))
#         generate_wordcloud(df[df["label"] == 1]["clean_tweet"], "Neutral WordCloud", os.path.join(output_dir, "neutral_wc.png"))
#         generate_wordcloud(df[df["label"] == 2]["clean_tweet"], "Positive WordCloud", os.path.join(output_dir, "positive_wc.png"))
#         print("✅ Word clouds saved inside outputs/")

#         # Summaries
#         print("\nGenerating AI-Generated Summaries...")
#         negative_summary = generate_template_summary(df[df["label"] == 0]["clean_tweet"], "Negative", counts.get(0, 0), amendment_name)
#         neutral_summary = generate_template_summary(df[df["label"] == 1]["clean_tweet"], "Neutral", counts.get(1, 0), amendment_name)
#         positive_summary = generate_template_summary(df[df["label"] == 2]["clean_tweet"], "Positive", counts.get(2, 0), amendment_name)

#         print("\n📄 AI-Generated Summaries:")
#         print(negative_summary)
#         print(neutral_summary)
#         print(positive_summary)

#         return {
#             "negative": negative_summary,
#             "neutral": neutral_summary,
#             "positive": positive_summary
#         }

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         raise e

# # ---------------- Run Standalone ----------------
# if __name__ == "__main__":
#     run_inference("uploads/AmendmentCombinedIncreased.csv", "outputs/predicted_tweets.csv")





# import matplotlib
# matplotlib.use("Agg")  # Use non-GUI backend for servers

# import os
# import re
# import string
# import pickle
# import pandas as pd
# import nltk
# from nltk.corpus import stopwords
# from nltk.stem import WordNetLemmatizer
# import matplotlib.pyplot as plt
# from wordcloud import WordCloud
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing.sequence import pad_sequences
# from tensorflow.keras.layers import Layer
# import tensorflow as tf
# import keras
# from collections import Counter

# # ---------------- Ensure NLTK Data ----------------
# def ensure_nltk_data():
#     for pkg in ["stopwords", "wordnet", "omw-1.4"]:
#         try:
#             nltk.data.find(f"corpora/{pkg}")
#         except LookupError:
#             nltk.download(pkg)

# ensure_nltk_data()

# english_stopwords = set(stopwords.words("english"))
# hinglish_stopwords = {"hai", "tha", "thi", "the", "aur", "kyunki", "phir", "yeh", "voh", "par", "mein"}
# lemmatizer = WordNetLemmatizer()

# # ---------------- Text Cleaning ----------------
# def remove_urls_mentions_hashtags(text):
#     text = re.sub(r"http\S+|www\S+|https\S+", "", text)
#     text = re.sub(r"@\w+|#\w+", "", text)
#     return text

# def remove_punctuation(text):
#     return text.translate(str.maketrans("", "", string.punctuation))

# def clean_tweet(text):
#     if pd.isnull(text):
#         return ""
#     text = text.lower()
#     text = remove_urls_mentions_hashtags(text)
#     text = remove_punctuation(text)
#     tokens = text.split()
#     tokens = [t for t in tokens if t not in english_stopwords and t not in hinglish_stopwords]
#     tokens = [lemmatizer.lemmatize(t) for t in tokens]
#     return " ".join(tokens).strip()

# # ---------------- Custom Attention Layer ----------------
# @keras.saving.register_keras_serializable()
# class AttentionLayer(Layer):
#     def __init__(self, **kwargs):
#         super(AttentionLayer, self).__init__(**kwargs)

#     def build(self, input_shape):
#         self.W = self.add_weight(
#             name="attention_weight",
#             shape=(input_shape[-1], 1),
#             initializer="random_normal",
#             trainable=True
#         )
#         self.b = self.add_weight(
#             name="attention_bias",
#             shape=(input_shape[1], 1),
#             initializer="zeros",
#             trainable=True
#         )
#         super(AttentionLayer, self).build(input_shape)

#     def call(self, inputs):
#         e = tf.keras.backend.tanh(tf.keras.backend.dot(inputs, self.W) + self.b)
#         a = tf.keras.backend.softmax(e, axis=1)
#         output = inputs * a
#         return tf.reduce_sum(output, axis=1)

#     def get_config(self):
#         config = super(AttentionLayer, self).get_config()
#         return config

# # ---------------- Load Model & Tokenizer ----------------
# BASE_DIR = os.path.dirname(__file__)
# MODEL_PATH = os.path.join(BASE_DIR, "sentiment_model_final.keras")
# TOKENIZER_PATH = os.path.join(BASE_DIR, "tokenizer.pkl")

# print("Loading model and tokenizer...")
# model = load_model(MODEL_PATH, custom_objects={"AttentionLayer": AttentionLayer})
# with open(TOKENIZER_PATH, "rb") as f:
#     tokenizer = pickle.load(f)

# MAXLEN = 50
# BATCH_SIZE = 128

# # ---------------- WordCloud ----------------
# # def generate_wordcloud(data, title, filename):
# #     if len(data) == 0:
# #         print(f"⚠ No data for {title}, skipping WordCloud.")
# #         return
# #     text = " ".join(data)
# #     wc = WordCloud(width=800, height=400, background_color="white").generate(text)
# #     plt.figure(figsize=(8, 4))
# #     plt.imshow(wc, interpolation="bilinear")
# #     plt.axis("off")
# #     plt.title(title)
# #     plt.savefig(filename)
# #     plt.close()
# def generate_wordcloud(data, title, filename):
#     try:
#         # Step 1: Ensure we have data
#         if len(data) == 0:
#             print(f"⚠ No data for {title}, skipping WordCloud.")
#             return

#         # Step 2: Ensure cleaned text is not empty
#         text = " ".join(data).strip()
#         if not text:
#             print(f"⚠ Empty text after cleaning for {title}, skipping WordCloud.")
#             return

#         # Step 3: Generate the WordCloud
#         wc = WordCloud(width=800, height=400, background_color="white").generate(text)

#         # Step 4: Plot safely
#         plt.figure(figsize=(8, 4))
#         plt.imshow(wc, interpolation="bilinear")
#         plt.axis("off")
#         plt.title(title)
#         plt.savefig(filename)
#         plt.close()
#         print(f"✅ Wordcloud saved: {filename}")

#     except Exception as e:
#         print(f"⚠ Failed to generate wordcloud for {title}: {e}")

# # ---------------- Summaries ----------------
# def generate_template_summary(data, sentiment_name, total_count, amendment_name, top_n=3):
#     all_text = " ".join(data)
#     words = [w for w in all_text.split() if w not in english_stopwords and w not in hinglish_stopwords]

#     if not words:
#         return f"Analysis of {total_count} comments provides limited insight into public perception of {amendment_name}. No strong themes emerged."

#     word_counts = Counter(words)
#     themes = [w for w, _ in word_counts.most_common(top_n)]
#     theme_str = '", "'.join(themes[:top_n])

#     if sentiment_name == "Positive":
#         return (f"AI-Generated Summary\n"
#                 f"Analysis of {total_count} comments indicates that {amendment_name} is met with strong public approval, "
#                 f"primarily driven by its perceived positive impacts. Key themes include \"{theme_str}.\" "
#                 f"Negative feedback is minimal and scattered, lacking a cohesive counter-narrative.")
#     elif sentiment_name == "Negative":
#         return (f"AI-Generated Summary\n"
#                 f"Analysis of {total_count} comments indicates that {amendment_name} faces significant public opposition, "
#                 f"largely due to concerns around negative impacts. Common themes include \"{theme_str}.\" "
#                 f"While some supportive views exist, they are limited and do not form a strong counterpoint to the prevailing criticism.")
#     elif sentiment_name == "Neutral":
#         return (f"AI-Generated Summary\n"
#                 f"Analysis of {total_count} comments shows a mixed public response to {amendment_name}. "
#                 f"Supporters highlight positive aspects, while critics emphasize negative aspects. "
#                 f"Key themes include \"{theme_str}.\" Overall, opinions are balanced, with no clear dominant narrative emerging.")
#     else:
#         return (f"AI-Generated Summary\n"
#                 f"Analysis of {total_count} comments provides insight into public perception of {amendment_name}. "
#                 f"Key themes include \"{theme_str}.\" Overall sentiment varies, with both positive and negative viewpoints contributing to the broader discussion.")

# # ---------------- Inference Pipeline ----------------
# def run_inference(input_csv, output_csv):
#     try:
#         print(f"Loading data from {input_csv}...")
#         df = pd.read_csv(input_csv)

#         amendment_name = os.path.splitext(os.path.basename(input_csv))[0].replace("_", " ").title()

#         if "label" not in df.columns:
#             df["label"] = -1

#         if "Comment" in df.columns:
#             df = df.rename(columns={"Comment": "tweet"})
#         if "tweet" not in df.columns:
#             raise ValueError("Input CSV must have a 'tweet' or 'Comment' column")

#         print("Cleaning tweets...")
#         df["clean_tweet"] = df["tweet"].apply(clean_tweet)

#         print("Tokenizing and padding sequences...")
#         sequences = tokenizer.texts_to_sequences(df["clean_tweet"])
#         X = pad_sequences(sequences, maxlen=MAXLEN)

#         empty_count = sum(len(seq) == 0 for seq in sequences)
#         print(f"Empty sequences after tokenization: {empty_count} / {len(df)}")

#         print("Running model predictions...")
#         pred_probs = model.predict(X, batch_size=BATCH_SIZE, verbose=1)
#         df["label"] = pred_probs.argmax(axis=1)
#         df["sentiment"] = df["label"].map({0: "Negative", 1: "Neutral", 2: "Positive"})

#         # Save labeled CSV
#         df.to_csv(output_csv, index=False, encoding="utf-8")
#         print(f"✅ Predictions saved to {output_csv}")

#         counts = df["label"].value_counts().to_dict()
#         print("\nSentiment Counts:")
#         print(f"Negative: {counts.get(0,0)}, Neutral: {counts.get(1,0)}, Positive: {counts.get(2,0)}")

#         # Generate WordClouds
#         output_dir = os.path.dirname(output_csv)
#         print("Generating WordClouds...")
#         generate_wordcloud(df[df["label"] == 0]["clean_tweet"], "Negative WordCloud", os.path.join(output_dir, "negative_wc.png"))
#         generate_wordcloud(df[df["label"] == 1]["clean_tweet"], "Neutral WordCloud", os.path.join(output_dir, "neutral_wc.png"))
#         generate_wordcloud(df[df["label"] == 2]["clean_tweet"], "Positive WordCloud", os.path.join(output_dir, "positive_wc.png"))
#         print("✅ Word clouds saved inside outputs/")

#         # Summaries
#         print("\nGenerating AI-Generated Summaries...")
#         negative_summary = generate_template_summary(df[df["label"] == 0]["clean_tweet"], "Negative", counts.get(0, 0), amendment_name)
#         neutral_summary = generate_template_summary(df[df["label"] == 1]["clean_tweet"], "Neutral", counts.get(1, 0), amendment_name)
#         positive_summary = generate_template_summary(df[df["label"] == 2]["clean_tweet"], "Positive", counts.get(2, 0), amendment_name)

#         print("\n📄 AI-Generated Summaries:")
#         print(negative_summary)
#         print(neutral_summary)
#         print(positive_summary)

#         return {
#             "negative": negative_summary,
#             "neutral": neutral_summary,
#             "positive": positive_summary
#         }

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         raise e

# # ---------------- Run Standalone ----------------
# if __name__ == "__main__":
#     run_inference("uploads/AmendmentCombinedIncreased.csv", "outputs/predicted_tweets.csv")

import matplotlib
matplotlib.use("Agg")
import pandas as pd
import os
import re
import string
import pickle
import nltk
from tensorflow.keras.layers import Layer
import tensorflow as tf
import keras
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from collections import Counter

# Download NLTK resources (safe check)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

english_stopwords = set(stopwords.words('english'))
hinglish_stopwords = set([
    "hai", "tha", "thi", "the", "aur", "kyunki", "phir", "yeh", "voh", "par", "mein"
])
lemmatizer = WordNetLemmatizer()


# ---------------- Text Cleaning ----------------
def remove_urls_mentions_hashtags(text):
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    text = re.sub(r"@\w+|#\w+", "", text)
    return text

def remove_punctuation(text):
    return text.translate(str.maketrans("", "", string.punctuation))

def clean_tweet(text):
    if pd.isnull(text):
        return ""
    text = text.lower()
    text = remove_urls_mentions_hashtags(text)
    text = remove_punctuation(text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in english_stopwords and t not in hinglish_stopwords]
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(tokens).strip()


# ---------------- Attention Layer ----------------
@keras.saving.register_keras_serializable()
class AttentionLayer(Layer):
    def __init__(self, **kwargs):
        super(AttentionLayer, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(
            name="attention_weight",
            shape=(input_shape[-1], 1),
            initializer="random_normal",
            trainable=True
        )
        self.b = self.add_weight(
            name="attention_bias",
            shape=(input_shape[1], 1),
            initializer="zeros",
            trainable=True
        )
        super(AttentionLayer, self).build(input_shape)

    def call(self, inputs):
        e = tf.keras.backend.tanh(tf.keras.backend.dot(inputs, self.W) + self.b)
        a = tf.keras.backend.softmax(e, axis=1)
        output = inputs * a
        return tf.reduce_sum(output, axis=1)

    def get_config(self):
        config = super(AttentionLayer, self).get_config()
        return config


# ---------------- Model + Tokenizer ----------------
print("Loading model and tokenizer...")
model = load_model(
    "sentiment_model_final.keras",
    custom_objects={"AttentionLayer": AttentionLayer}
)

with open("tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

MAXLEN = 50
BATCH_SIZE = 128


# ---------------- WordCloud (Safe) ----------------
def generate_wordcloud(data, title, filename):
    try:
        if data is None or len(data) == 0:
            print(f"⚠ No data for {title}, skipping WordCloud.")
            return

        text = " ".join(data).strip()
        if not text:
            print(f"⚠ Empty text after cleaning for {title}, skipping WordCloud.")
            return

        wc = WordCloud(width=800, height=400, background_color="white").generate(text)

        plt.figure(figsize=(8, 4))
        plt.imshow(wc, interpolation="bilinear")
        plt.axis("off")
        plt.title(title)
        plt.savefig(filename)
        plt.close()
        print(f"✅ WordCloud saved: {filename}")

    except Exception as e:
        print(f"⚠ WordCloud generation failed for {title}: {e}")


# ---------------- Template Summary ----------------
def generate_template_summary(data, sentiment_name, total_count, amendment_name, top_n=3):
    all_text = " ".join(data)
    words = [w for w in all_text.split() if w not in english_stopwords and w not in hinglish_stopwords]

    if not words:
        return f"Analysis of {total_count} comments provides limited insight into public perception of {amendment_name}. No strong themes emerged."

    word_counts = Counter(words)
    themes = [w for w, _ in word_counts.most_common(top_n)]
    theme_str = '", "'.join(themes[:top_n])

    if sentiment_name == "Positive":
        return (f"AI-Generated Summary\n"
                f"Analysis of {total_count} comments indicates that {amendment_name} is met with strong public approval, "
                f"primarily driven by its perceived positive impacts. Key themes include \"{theme_str}.\" "
                f"Negative feedback is minimal and scattered, lacking a cohesive counter-narrative.")
    
    elif sentiment_name == "Negative":
        return (f"AI-Generated Summary\n"
                f"Analysis of {total_count} comments indicates that {amendment_name} faces significant public opposition, "
                f"largely due to concerns around negative impacts. Common themes include \"{theme_str}.\" "
                f"While some supportive views exist, they are limited and do not form a strong counterpoint to the prevailing criticism.")
    
    elif sentiment_name == "Neutral":
        return (f"AI-Generated Summary\n"
                f"Analysis of {total_count} comments shows a mixed public response to {amendment_name}. "
                f"Supporters highlight positive aspects, while critics emphasize negative aspects. "
                f"Key themes include \"{theme_str}.\" Overall, opinions are balanced, with no clear dominant narrative emerging.")
    
    else:
        return (f"AI-Generated Summary\n"
                f"Analysis of {total_count} comments provides insight into public perception of {amendment_name}. "
                f"Key themes include \"{theme_str}.\" Overall sentiment varies, with both positive and negative viewpoints contributing to the broader discussion.")


# ---------------- Inference Pipeline ----------------
def run_inference(input_csv, output_csv):
    print(f"Loading data from {input_csv}...")
    df = pd.read_csv(input_csv)

    amendment_name = os.path.splitext(os.path.basename(input_csv))[0].replace("_", " ").title()

    if 'label' not in df.columns:
        df['label'] = -1

    if 'Comment' in df.columns:
        df = df.rename(columns={'Comment': 'tweet'})
    if 'tweet' not in df.columns:
        raise ValueError("Input CSV must have a 'tweet' column")

    print("Cleaning tweets...")
    df['clean_tweet'] = df['tweet'].apply(clean_tweet)

    print("Tokenizing and padding sequences...")
    sequences = tokenizer.texts_to_sequences(df['clean_tweet'])
    X = pad_sequences(sequences, maxlen=MAXLEN)

    empty_count = sum(len(seq) == 0 for seq in sequences)
    print(f"Empty sequences after tokenization: {empty_count} / {len(df)}")

    print("Running model predictions...")
    pred_probs = model.predict(X, batch_size=BATCH_SIZE, verbose=1)
    df['label'] = pred_probs.argmax(axis=1)
    df['sentiment'] = df['label'].map({0: "Negative", 1: "Neutral", 2: "Positive"})

    df.to_csv(output_csv, index=False, encoding='utf-8')
    print(f"✅ Predictions saved to {output_csv}")

    counts = df['label'].value_counts().to_dict()
    print("\nSentiment Counts:")
    print(f"Negative: {counts.get(0,0)}, Neutral: {counts.get(1,0)}, Positive: {counts.get(2,0)}")

    output_dir = os.path.dirname(output_csv)
    print("Generating WordClouds...")
    generate_wordcloud(df[df['label']==0]['clean_tweet'], "Negative WordCloud", os.path.join(output_dir, "negative_wc.png"))
    generate_wordcloud(df[df['label']==1]['clean_tweet'], "Neutral WordCloud", os.path.join(output_dir, "neutral_wc.png"))
    generate_wordcloud(df[df['label']==2]['clean_tweet'], "Positive WordCloud", os.path.join(output_dir, "positive_wc.png"))
    print("✅ Wordclouds generated")

    print("\nGenerating AI-Generated Summaries...")
    negative_summary = generate_template_summary(df[df['label']==0]['clean_tweet'], "Negative", counts.get(0,0), amendment_name)
    neutral_summary  = generate_template_summary(df[df['label']==1]['clean_tweet'], "Neutral", counts.get(1,0), amendment_name)
    positive_summary = generate_template_summary(df[df['label']==2]['clean_tweet'], "Positive", counts.get(2,0), amendment_name)

    print("\n📄 AI-Generated Summaries:")
    print(negative_summary)
    print(neutral_summary)
    print(positive_summary)

    return {
        "negative": negative_summary,
        "neutral": neutral_summary,
        "positive": positive_summary
    }


# ---------------- Run Standalone ----------------
if __name__ == "__main__":
    run_inference("uploads/AmendmentCombinedIncreased.csv", "outputs/predicted_tweets.csv")


