# Universal Entertainment Tracker

A full-stack web application for discovering, tracking, and managing anime, movies, TV shows, and web series from around the world.

## Features

- 🔍 **Universal Search** - Find anime, movies, and TV shows in one place
- 📚 **Personal Library** - Track your watchlist with statuses (watching, completed, plan to watch, etc.)
- 📊 **Episode Tracking** - Mark individual episodes as watched
- 📈 **Statistics** - View your viewing history and statistics
- ⭐ **Ratings & Notes** - Rate content and add personal notes
- 🎨 **Clean Design** - Minimalist, accessible interface
- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens
- 🌙 **Dark Mode** - Toggle between light and dark themes

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- TanStack Query for data fetching
- Zustand for state management

### Backend
- Python 3.12+ with FastAPI
- MongoDB for data persistence
- TMDB & AniList API integration
- JWT authentication
- Argon2 password hashing

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- MongoDB (or Docker)
- TMDB API key ([Get one free here](https://www.themoviedb.org/settings/api))

### Option 1: Using Docker (Recommended)

```bash
# Start everything
docker-compose up --build -d

# Wait 30-60 seconds, then open http://localhost:5173
```

### Option 2: Manual Setup

#### 1. Start MongoDB

Using Docker:
```bash
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

Or install MongoDB locally from: https://www.mongodb.com/try/download/community

#### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env and add your TMDB_API_KEY and generate JWT secrets
# Use any random string for JWT secrets (at least 32 characters)

# Run backend
python -m uvicorn app.main:app --reload
```

Backend will run on: http://localhost:8000  
API docs: http://localhost:8000/docs

#### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run frontend
npm run dev
```

Frontend will run on: http://localhost:5173

### Access the Application

Open your browser and go to: **http://localhost:5173**

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=entertainment_tracker

# JWT Secrets (generate random strings)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this

# TMDB API Key
TMDB_API_KEY=your-tmdb-api-key-here

# Other settings
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### Frontend Environment Variables

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Development

### Backend Commands

```bash
# Run with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Lint and format
ruff check .
ruff format .
```

### Frontend Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Start with build
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Restart services
docker-compose restart
```

## Project Structure

```
.
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Core configuration
│   │   ├── db/            # Database setup
│   │   ├── models/        # Data models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   └── integrations/  # External APIs (TMDB, AniList)
│   ├── tests/             # Backend tests
│   └── requirements.txt
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── package.json
└── docker-compose.yml
```

## Features in Detail

### Authentication
- User registration with email verification
- Secure login/logout
- JWT access tokens with refresh token rotation
- Password reset functionality

### Media Discovery
- Search across movies, TV shows, and anime
- Filter by genre, year, rating
- View trending and popular content
- Get detailed information and recommendations

### Library Management
- Add titles to your personal library
- Set status: Plan to Watch, Watching, Completed, On Hold, Dropped
- Rate titles and add personal notes
- Track when you started/completed titles

### Episode Tracking
- Mark individual episodes as watched
- Track progress across seasons
- View watch history
- Resume watching from last position

### Statistics Dashboard
- Total titles tracked
- Completed counts by media type
- Episodes watched
- Hours watched (estimated)
- Favorite genres
- Recently completed titles

## Testing

### Backend Tests

```bash
cd backend
pytest
```

Tests cover:
- Authentication flows
- Authorization checks
- Library management
- Episode tracking
- Statistics calculation

### Frontend Tests

```bash
cd frontend
npm run test
```

## Deployment

### Backend Deployment

1. Set production environment variables
2. Set `ENVIRONMENT=production`
3. Set `COOKIE_SECURE=true` for HTTPS
4. Use MongoDB Atlas for database
5. Deploy to platform of choice (Railway, Render, AWS, etc.)

### Frontend Deployment

1. Build: `npm run build`
2. Deploy `dist` folder to static hosting (Vercel, Netlify, etc.)
3. Configure production API URL

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Security

- All passwords hashed with Argon2
- JWT tokens with short expiration
- HTTP-only secure cookies
- Rate limiting on auth endpoints
- Input validation with Pydantic
- CORS configuration
- Environment-based secrets

## API Rate Limits

- Respects TMDB API rate limits
- Respects AniList API rate limits
- Authentication endpoints are rate-limited
- Caching implemented to reduce API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `docker ps` or MongoDB service
- Verify `.env` file exists and has all required values
- Check Python version: `python --version` (needs 3.12+)

### Frontend won't start
- Check Node.js version: `node --version` (needs 18+)
- Run `npm install` again
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Docker issues
- Make sure Docker Desktop is running
- Try: `docker-compose down -v` then rebuild
- Check Docker has enough memory (4GB+ recommended)

### API connection errors
- Verify backend is running on port 8000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check CORS settings in backend

### TMDB API errors
- Verify your TMDB API key is valid
- Check you haven't exceeded rate limits
- Ensure key is in `backend/.env`

## License

MIT License - see [LICENSE](LICENSE) file

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie and TV show data
- [AniList](https://anilist.co/) for anime data
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent framework
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## Support

For issues and questions, please open an issue on GitHub.
