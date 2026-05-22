import os
import json
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

class LocalIntentRouter:
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
            ('clf', LogisticRegression(random_state=42, class_weight='balanced'))
        ])
        self.is_trained = False
        self._train_model()

    def _train_model(self):
        # A tiny hardcoded dataset to bootstrap the local ML model.
        # This allows 0ms intent routing for UI slides without hitting the cloud LLM.
        data = [
            ("what services do you offer", "show_services"),
            ("tell me about your services", "show_services"),
            ("how can you help me", "show_services"),
            ("what is your expertise", "show_services"),
            ("services", "show_services"),
            ("what do you do", "show_services"),
            
            ("how does the process work", "show_process"),
            ("what is the process", "show_process"),
            ("how do we start", "show_process"),
            ("what are the steps", "show_process"),
            ("process", "show_process"),
            
            ("who are your clients", "show_clients"),
            ("what companies have you worked with", "show_clients"),
            ("do you have examples of clients", "show_clients"),
            ("clients", "show_clients"),
            ("portfolio", "show_clients"),

            ("who are you", "about_us"),
            ("tell me about yourself", "about_us"),
            ("about maneuver", "about_us"),
            ("what is maneuver", "about_us"),
            ("about us", "about_us"),
            
            ("hello", "general"),
            ("hi there", "general"),
            ("yes", "general"),
            ("no", "general"),
            ("maybe", "general"),
            ("that sounds good", "general"),
            ("okay", "general"),
            ("i see", "general")
        ]

        texts = [item[0] for item in data]
        labels = [item[1] for item in data]

        self.pipeline.fit(texts, labels)
        self.is_trained = True
        logger.info("Local ML Intent Router trained successfully on boot.")

    def predict_intent(self, text: str):
        if not self.is_trained or not text.strip():
            return "general"
            
        prediction = self.pipeline.predict([text])[0]
        probabilities = self.pipeline.predict_proba([text])[0]
        max_prob = max(probabilities)
        
        # Confidence threshold to avoid false positives
        if max_prob > 0.35:
            return prediction
        return "general"

# Singleton instance
intent_router = LocalIntentRouter()
