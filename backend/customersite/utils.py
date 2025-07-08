import requests
from django.conf import settings

def get_lat_lng_from_address(address_text):
    endpoint = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address_text,
        "key": settings.GOOGLE_MAPS_API_KEY
    }
    response = requests.get(endpoint, params=params)
    if response.status_code == 200:
        result = response.json()
        if result['results']:
            location = result['results'][0]['geometry']['location']
            return location['lat'], location['lng']
    return None, None
