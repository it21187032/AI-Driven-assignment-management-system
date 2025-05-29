# Assignment Management System

A modern web application for managing and evaluating assignments using AI-powered similarity checking and grading.

## 🚀 Technologies Used

### Backend
- **Python 3.x**
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-SQLAlchemy** - Database ORM
- **PyTorch** - Deep learning framework
- **Transformers** - Hugging Face transformers library
- **Sentence-Transformers** - For text embeddings and similarity checking

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 🤖 AI Features
- **Text Similarity Detection**: Uses Sentence-Transformers to detect similar submissions
- **Automated Grading**: AI-powered evaluation of assignments
- **Plagiarism Detection**: Advanced similarity checking between submissions

## 🛠️ Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```bash
   python run.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## 🌐 Running the Application
1. The backend server will run on `http://localhost:5000`
2. The frontend development server will run on `http://localhost:3000`

## 📝 Features
- Assignment submission and management
- AI-powered similarity checking
- Automated grading system
- User authentication and authorization
- Real-time updates
- Modern and responsive UI

## 🔒 Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your_secret_key
```

## 📚 API Documentation
The API documentation is available at `http://localhost:5000/api/docs` when the backend server is running.

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details. 