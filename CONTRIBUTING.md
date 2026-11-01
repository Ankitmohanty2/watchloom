# Contributing to Universal Entertainment Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a new branch for your feature/fix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

See [SETUP.md](SETUP.md) for complete setup instructions.

## Code Style

### Backend (Python)
- Follow PEP 8
- Use type hints
- Run `ruff check .` before committing
- Run `ruff format .` to format code
- Write docstrings for functions

### Frontend (TypeScript/React)
- Use TypeScript for type safety
- Follow React best practices
- Run `npm run lint` before committing
- Use functional components with hooks
- Write meaningful component names

## Testing

### Backend
```powershell
cd backend
pytest
pytest --cov=app
```

### Frontend
```powershell
cd frontend
npm run test
npm run type-check
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update README.md if necessary
5. Follow the PR template
6. Link related issues

## Commit Messages

Use clear and descriptive commit messages:
- `feat: Add episode tracking feature`
- `fix: Resolve authentication token expiry issue`
- `docs: Update setup instructions`
- `test: Add tests for library service`
- `refactor: Improve media service performance`

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## Questions?

Open an issue for discussion!
