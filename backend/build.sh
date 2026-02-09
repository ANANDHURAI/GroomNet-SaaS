
set -o errexit

# 1. Install dependencies
pip install -r requirements.txt

# 2. Collect static files
python manage.py collectstatic --no-input

# 3. Apply database migrations
python manage.py migrate

# 4. Create Superuser (Automatically uses Env Vars)

python manage.py createsuperuser --no-input || true