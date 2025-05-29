from flask import Blueprint, request, jsonify
from .models import db, Answer
from .ml_model import evaluate_answer

main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def home():
    return "Backend is running!"

@main.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    if not data or 'answer' not in data:
        return jsonify({'error': 'No answer provided'}), 400
    
    answer_text = data['answer']
    score = evaluate_answer(answer_text)
    
    # Save to database
    new_answer = Answer(text=answer_text, score=score)
    db.session.add(new_answer)
    db.session.commit()
    
    return jsonify({
        'score': score,
        'message': 'Answer evaluated successfully'
    }) 