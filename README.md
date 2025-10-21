# CoverFolio

A full-stack resume to portfolio and cover letter generator application built with Django, React, and GraphQL.

## Tech Stack

- **Backend**: Django 5.2.7 with Django REST Framework and Graphene (GraphQL)
- **Frontend**: React 19.2 with TypeScript and Tailwind CSS
- **Database**: PostgreSQL
- **Parsing Service**: Node.js/TypeScript

## Prerequisites

- Python 3.12+
- Node.js 16+
- PostgreSQL 14+
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/RAHASYABARKUR/CoverFolio.git
cd CoverFolio
```

### 2. Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env with your database credentials
# nano .env or use your preferred editor

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start Django server
python manage.py runserver 8001
```

Backend will run at `http://localhost:8001`

### 3. Frontend Setup (React)

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

Frontend will run at `http://localhost:3000`

### 4. Parsing Service Setup (Node.js)

```bash
# Navigate to parsing-service directory (from root)
cd parsing-service

# Install dependencies
npm install

# Start the service
npm start
```

### 5. Database Setup

Make sure PostgreSQL is running:

```bash
# On macOS with Homebrew:
brew services start postgresql@14

# Create database
psql postgres -c "CREATE DATABASE coverfolio_db;"
```

## Project Structure

```
CoverFolio/
├── backend/              # Django backend
│   ├── coverfolio/      # Main Django project settings
│   ├── users/           # User management app
│   ├── portfolio/       # Portfolio management app
│   ├── analytics/       # Analytics app
│   ├── manage.py
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── parsing-service/     # Document parsing service
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_NAME=coverfolio_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

## Available Scripts

### Backend
- `python manage.py runserver` - Start Django development server
- `python manage.py migrate` - Run database migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py test` - Run tests

### Frontend
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/FeatureName`)
3. Commit your changes (`git commit -m 'Add some FeatureName'`)
4. Push to the branch (`git push origin feature/FeatureName`)
5. Open a Pull Request
