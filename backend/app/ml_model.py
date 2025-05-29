from sentence_transformers import SentenceTransformer
import torch
import numpy as np

# Load the model
model = SentenceTransformer('all-MiniLM-L6-v2')

def evaluate_answer(answer_text):
    """
    Evaluate the answer using the sentence transformer model.
    Returns a score between 0 and 1.
    """
    # Encode the answer
    answer_embedding = model.encode(answer_text)
    
    # For now, return a simple score based on answer length
    # This is a placeholder - you should implement your actual evaluation logic
    score = min(len(answer_text) / 1000, 1.0)  # Score based on length, max 1.0
    
    return float(score) 