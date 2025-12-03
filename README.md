# CoverFolio


A modern portfolio and cover letter generator with AI-powered resume parsing.


## Prerequisites


- Python 3.9+
- Node.js 16+
- PostgreSQL database (Supabase cloud hosting recommended)


## Quick Start


### Running the Application


#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
pip install setuptools
python manage.py runserver
```


#### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm install jszip file-saver
npm install --save-dev @types/jszip @types/file-saver
npm start
```


### Access the Application


- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **Supabase Dashboard**: https://app.supabase.com/ → Table Editor


## Common Commands


```bash
# Test database connection
cd backend && python test_config.py


# Apply new migrations
python manage.py migrate


# Open Django shell
python manage.py shell


# View all Django commands
python manage.py help
```

## Tech Stack

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL (Supabase cloud hosting)
- JWT Authentication
- Google Generative AI for parsing


**Frontend:**
- React + TypeScript
- React Router
- Axios
- Modern CSS

## License


MIT
