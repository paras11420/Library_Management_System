To start the project - 

cd projects/Library_management_system/library_system/

Backend - 	
cd projects/Library_management_system/library_system/
source venv/bin/activate 
python manage.py runserver


Celery worker - 
cd projects/Library_management_system/library_system/
source venv/bin/activate
celery -A library_system worker --loglevel=info


Celery beat server - 
cd projects/Library_management_system/library_system/
source venv/bin/activate
celery -A library_system beat -l info


Reddis server - 
cd projects/Library_management_system/library_system/
source venv/bin/activate
redis-server


Frontend - 
cd projects/Library_management_system/library_system/
cd library-frontend
npm run dev



GitHub update - 

git status
git add .
git commit -m "Updated Home.jsx with new button colors"
git push origin main
