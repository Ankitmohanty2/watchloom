# Setup Guide

## Quick Setup (5 minutes)

### 1. Install Prerequisites

- **Python 3.12+**: https://www.python.org/downloads/
- **Node.js 18+**: https://nodejs.org/
- **Docker** (optional): https://www.docker.com/get-started
- **TMDB API Key** (free): https://www.themoviedb.org/settings/api

### 2. Choose Your Setup Method

## Option A: Docker (Easiest)

```bash
# Start everything
docker-compose up --build -d

# Wait 30-60 seconds
# Open http://localhost:5173
```

Done! ✅

---

## Option B: Manual Setup

### Step 1: Start MongoDB

**Using Docker:**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

**Or install MongoDB locally:**  
https://www.mongodb.com/try/download/community

### Step 2: Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and add your TMDB_API_KEY

# Start backend
python -m uvicorn app.main:app --reload
```

Backend runs on: http://localhost:8000

### Step 3: Setup Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start frontend
npm run dev
```

Frontend runs on: http://localhost:5173

### Step 4: Open Your Browser

Go to: **http://localhost:5173**

---

## Environment Configuration

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=entertainment_tracker
JWT_SECRET_KEY=generate-a-random-32-character-string-here
REFRESH_TOKEN_SECRET=generate-another-random-32-character-string
TMDB_API_KEY=your-tmdb-api-key-here
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Verify Installation

### Check Backend
Visit: http://localhost:8000/docs  
You should see the API documentation.

### Check Frontend
Visit: http://localhost:5173  
You should see the homepage.

### Test the App
1. Click "Sign Up"
2. Create an account
3. Search for a movie/show
4. Add it to your library

---

## Common Issues

### "Python not found"
Install Python 3.12+ and make sure it's in your PATH.

### "Node not found"
Install Node.js 18+ from nodejs.org

### "MongoDB connection error"
Make sure MongoDB is running:
```bash
docker ps  # Should show mongodb container
```

### "Port already in use"
- Backend (8000): Stop other apps using port 8000
- Frontend (5173): Stop other Vite apps
- MongoDB (27017): Stop other MongoDB instances

---

## Next Steps

- Read the full [README.md](README.md) for more details
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Explore the API at http://localhost:8000/docs
