# Flask Backend

This is the backend server for the assignment evaluation system.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Unix/MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

1. Make sure your virtual environment is activated
2. Run the server:
```bash
python run.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Evaluate Answer
- **URL**: `/api/evaluate`
- **Method**: `POST`
- **Body**:
```json
{
    "answer": "Your answer text here"
}
```
- **Response**:
```json
{
    "score": 0.85,
    "message": "Answer evaluated successfully"
}
``` 