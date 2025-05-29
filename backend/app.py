from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
import json
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes

app = Flask(__name__)
CORS(app)


from transformers import AutoModel, AutoTokenizer
import torch

# Load the ML Model (✅ Load it once when the app starts)
model_path = 'sentence-transformers/all-MiniLM-L6-v2'  # Update this to your model's actual path

# Load the model and tokenizer
model = AutoModel.from_pretrained(model_path, trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)

# Set the device to GPU if available, else use CPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Move the model to the device (GPU or CPU)
model.to(device)

# Set the model to evaluation mode
model.eval()



# Function to process text into embeddings
def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def get_sentence_embeddings(sentence):
    encoded_input = tokenizer([sentence], padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        model_output = model(**encoded_input)
    sentence_embeddings = mean_pooling(model_output, encoded_input["attention_mask"])
    sentence_embeddings = F.normalize(sentence_embeddings, p=2, dim=1)
    return sentence_embeddings

# Home Route (Check if Backend is Running)

@app.route('/')
def home():
    print("Home route accessed!")
    return "Backend is running!"

@app.route("/evaluate", methods=["POST"])
def evaluate_answer():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "question" not in data or "model_answer" not in data or "student_answer" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    question = data["question"]
    model_answer = data["model_answer"]
    student_answer = data["student_answer"]

    try:
        # Ensure the answers are not too long or too short
        if len(model_answer) > 512 or len(student_answer) > 512:
            return jsonify({"error": "Answer too long"}), 400

        encoded_input_01 = tokenizer(model_answer, padding="max_length", truncation=True, max_length=50, return_tensors="pt").to(device)
        encoded_input_02 = tokenizer(student_answer, padding="max_length", truncation=True, max_length=50, return_tensors="pt").to(device)

        with torch.no_grad():
            model_output_01 = model(**encoded_input_01)
            model_output_02 = model(**encoded_input_02)

        sentence_embeddings_01 = mean_pooling(model_output_01, encoded_input_01["attention_mask"])
        sentence_embeddings_02 = mean_pooling(model_output_02, encoded_input_02["attention_mask"])

        sentence_embeddings_01 = F.normalize(sentence_embeddings_01, p=2, dim=1)
        sentence_embeddings_02 = F.normalize(sentence_embeddings_02, p=2, dim=1)

        cosine_score = F.cosine_similarity(sentence_embeddings_01, sentence_embeddings_02)
        rating_score = (cosine_score * 100).cpu().numpy().squeeze()
        rating_score = max(0, min(100, rating_score))

        return jsonify({"score": round(float(rating_score), 2)})

    except Exception as e:
        return jsonify({"error": f"Error during evaluation: {str(e)}"}), 500


   

# Database setup (using SQLite for now)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///exam_system.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# Models
class Question(db.Model):
    id = db.Column(db.String(10), primary_key=True)  # e.g., "Q001"
    text = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(10), nullable=False)  # Easy, Medium, Hard
    point_value = db.Column(db.Integer, nullable=False)
    has_reference = db.Column(db.Boolean, default=False)
    submission_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    tags = db.Column(db.String(255))  # Store as comma-separated values
    time_limit = db.Column(db.Integer, nullable=True)  # in minutes
    allow_file_upload = db.Column(db.Boolean, default=True)
    allow_text_answer = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TeacherGuide(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_path = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudentAssignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    question_id = db.Column(db.String(10), nullable=False)
    file_path = db.Column(db.String(255), nullable=True)
    text_answer = db.Column(db.Text, nullable=True)
    score = db.Column(db.Float, nullable=True)
    feedback = db.Column(db.String(255), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# Upload Teacher Guide
@app.route("/upload_teacher_guide", methods=["POST"])
def upload_teacher_guide():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    file_path = os.path.join("uploads", "teacher_guides", file.filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    file.save(file_path)

    guide = TeacherGuide(file_path=file_path)
    db.session.add(guide)
    db.session.commit()

    return jsonify({"message": "Teacher guide uploaded successfully!"})

# Upload Student Assignment & Process It
@app.route("/upload_assignment", methods=["POST"])
def upload_assignment():
    student_id = request.form.get("student_id")
    question_id = request.form.get("question_id")
    text_answer = request.form.get("text_answer")
    file = request.files.get("file")

    if not student_id or not question_id:
        return jsonify({"error": "Missing student_id or question_id"}), 400

    if not text_answer and not file:
        return jsonify({"error": "Either text_answer or file must be provided"}), 400

    # Load questions to get the correct answer
    questions = load_questions()
    question = next((q for q in questions if q["id"] == question_id), None)
    if not question:
        return jsonify({"error": "Question not found"}), 404

    # Calculate similarity score using the ML model
    correct_answer = question["correctAnswer"]
    student_answer = text_answer if text_answer else ""
    
    try:
        # Get embeddings for both answers
        encoded_input_01 = tokenizer(correct_answer, padding="max_length", truncation=True, max_length=50, return_tensors="pt").to(device)
        encoded_input_02 = tokenizer(student_answer, padding="max_length", truncation=True, max_length=50, return_tensors="pt").to(device)

        with torch.no_grad():
            model_output_01 = model(**encoded_input_01)
            model_output_02 = model(**encoded_input_02)

        sentence_embeddings_01 = mean_pooling(model_output_01, encoded_input_01["attention_mask"])
        sentence_embeddings_02 = mean_pooling(model_output_02, encoded_input_02["attention_mask"])

        sentence_embeddings_01 = F.normalize(sentence_embeddings_01, p=2, dim=1)
        sentence_embeddings_02 = F.normalize(sentence_embeddings_02, p=2, dim=1)

        cosine_score = F.cosine_similarity(sentence_embeddings_01, sentence_embeddings_02)
        score = (cosine_score * 100).cpu().numpy().squeeze()
        score = max(0, min(100, score))
        score = round(float(score), 2)

        # Generate feedback based on score
        if score >= 90:
            feedback = "Excellent answer! Very well done."
        elif score >= 80:
            feedback = "Good answer! Consider adding more details."
        elif score >= 70:
            feedback = "Decent answer. Try to be more specific."
        else:
            feedback = "Needs improvement. Please review the question and try again."

        # Save the submission
        submissions = load_submissions()
        submission = {
            "id": f"S{len(submissions) + 1:03d}",
            "student_id": student_id,
            "question_id": question_id,
            "text_answer": text_answer,
            "file_path": file.filename if file else None,
            "score": score,
            "feedback": feedback,
            "submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        submissions.append(submission)
        save_submissions(submissions)

        return jsonify({
            "message": "Assignment submitted successfully!",
            "score": score,
            "feedback": feedback
        })

    except Exception as e:
        return jsonify({"error": f"Error during evaluation: {str(e)}"}), 500

# Fetch Results for Students & Teachers
@app.route("/get_results/<int:user_id>/<string:user_type>", methods=["GET"])
def get_results(user_id, user_type):
    try:
        submissions = load_submissions()
        if user_type == "student":
            results = [s for s in submissions if str(s["student_id"]) == str(user_id)]
        elif user_type == "teacher":
            results = submissions  # Teachers see all
        else:
            return jsonify({"error": "Invalid user type"}), 400
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

QUESTIONS_FILE = 'questions.json'
SUBMISSIONS_FILE = 'submissions.json'

def load_questions():
    try:
        if not os.path.exists(QUESTIONS_FILE):
            # Create an empty questions file if it doesn't exist
            with open(QUESTIONS_FILE, 'w') as f:
                json.dump([], f)
            return []
        
        with open(QUESTIONS_FILE, 'r') as f:
            questions = json.load(f)
            # Ensure all required fields are present
            for q in questions:
                q.setdefault("hasReference", False)
                q.setdefault("submissionCount", 0)
                q.setdefault("isActive", True)
                q.setdefault("tags", [])
                q.setdefault("allowFileUpload", True)
                q.setdefault("allowTextAnswer", True)
                q.setdefault("dueDate", "")
            return questions
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading questions: {str(e)}")
        return []

def save_questions(questions):
    with open(QUESTIONS_FILE, 'w') as f:
        json.dump(questions, f, indent=2)

def load_submissions():
    try:
        with open(SUBMISSIONS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_submissions(submissions):
    with open(SUBMISSIONS_FILE, 'w') as f:
        json.dump(submissions, f, indent=2)

@app.route("/questions", methods=["GET"])
def get_questions():
    try:
        questions = load_questions()
        # Convert the questions to match the frontend's expected format
        formatted_questions = [
            {
                "id": q["id"],
                "text": q["text"],
                "correctAnswer": q["correctAnswer"],
                "difficulty": q["difficulty"],
                "pointValue": q["pointValue"],
                "hasReference": q.get("hasReference", False),
                "submissionCount": q.get("submissionCount", 0),
                "isActive": q.get("isActive", True),
                "tags": q.get("tags", []),
                "timeLimit": q.get("timeLimit"),
                "allowFileUpload": q.get("allowFileUpload", True),
                "allowTextAnswer": q.get("allowTextAnswer", True),
                "dueDate": q.get("dueDate", "")
            }
            for q in questions
        ]
        return jsonify(formatted_questions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/questions", methods=["POST"])
def create_question():
    data = request.get_json()
    questions = load_questions()
    # Generate new question ID
    if questions:
        last_id = questions[-1]["id"]
        last_num = int(last_id[1:])
        new_id = f"Q{str(last_num + 1).zfill(3)}"
    else:
        new_id = "Q001"
    question = {
        "id": new_id,
        "text": data["text"],
        "correctAnswer": data["correctAnswer"],
        "difficulty": data["difficulty"],
        "pointValue": data["pointValue"],
        "hasReference": data.get("hasReference", False),
        "submissionCount": 0,
        "isActive": data.get("isActive", True),
        "tags": data.get("tags", []),
        "timeLimit": data.get("timeLimit"),
        "allowFileUpload": data.get("allowFileUpload", True),
        "allowTextAnswer": data.get("allowTextAnswer", True)
    }
    questions.append(question)
    save_questions(questions)
    return jsonify(question)

@app.route("/questions/<question_id>", methods=["PUT"])
def update_question(question_id):
    data = request.get_json()
    questions = load_questions()
    for q in questions:
        if q["id"] == question_id:
            q["text"] = data["text"]
            q["correctAnswer"] = data["correctAnswer"]
            q["difficulty"] = data["difficulty"]
            q["pointValue"] = data["pointValue"]
            q["hasReference"] = data.get("hasReference", q["hasReference"])
            q["isActive"] = data.get("isActive", q["isActive"])
            q["tags"] = data.get("tags", q["tags"])
            q["timeLimit"] = data.get("timeLimit", q["timeLimit"])
            q["allowFileUpload"] = data.get("allowFileUpload", q["allowFileUpload"])
            q["allowTextAnswer"] = data.get("allowTextAnswer", q["allowTextAnswer"])
            save_questions(questions)
            return jsonify(q)
    return jsonify({"error": "Question not found"}), 404

@app.route("/questions/<question_id>", methods=["DELETE"])
def delete_question(question_id):
    questions = load_questions()
    new_questions = [q for q in questions if q["id"] != question_id]
    if len(new_questions) == len(questions):
        return jsonify({"error": "Question not found"}), 404
    save_questions(new_questions)
    return jsonify({"message": "Question deleted successfully"})

@app.route("/extract_text_from_file", methods=["POST"])
def extract_text_from_file():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    extracted_text = ""
    try:
        if file.filename.endswith(".pdf"):
            pages = convert_from_bytes(file.read())
            for page in pages:
                extracted_text += pytesseract.image_to_string(page)
        else:
            image = Image.open(file.stream)
            extracted_text = pytesseract.image_to_string(image)

        return jsonify({"extracted_text": extracted_text.strip()})

    except Exception as e:
        return jsonify({"error": f"Failed to process file: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=os.getenv("FLASK_DEBUG", "False") == "True")
