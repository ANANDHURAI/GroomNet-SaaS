
# Exit on error
set -o errexit

pip install -r requirements.txt

# Convert static files
python manage.py collectstatic --no-input

# Apply migrations
python manage.py migrate
