# CoverFolio

## Quick Start 
### Ensure PostgreSQL is running
```
brew services list | grep postgresql
```
### Terminal 1 - Backend
```
cd backend
source venv/bin/activate
pip install -r requirements.txt
pip install setuptools
python manage.py runserver
```

### Terminal 2 - Frontend
```
cd frontend
npm install && npm start
```