# eld_api/utils/route_calculator.py
import requests
import math
import os
from datetime import datetime, timedelta
import polyline

# Normally we would use environment variables, but for simplicity in this example
API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"  # Replace with actual API key in production

def calculate_route(start_coords, pickup_coords, dropoff_coords):
    """
    Calculate route details between starting point, pickup, and delivery locations
    
    Args:
        start_coords: Tuple of (latitude, longitude) for starting point
        pickup_coords: Tuple of (latitude, longitude) for pickup location
        dropoff_coords: Tuple of (latitude, longitude) for delivery location
        
    Returns:
        Dictionary with route details including waypoints, distance, duration, etc.
    """
    # In a real implementation, we would call an external API like Google Maps
    # For this example, we'll use a simplified calculation and mock some data
    
    # Calculate distances using the Haversine formula
    start_to_pickup_distance = haversine_distance(start_coords, pickup_coords)
    pickup_to_dropoff_distance = haversine_distance(pickup_coords, dropoff_coords)
    
    # Calculate estimated driving times (assume 60 mph average speed)
    start_to_pickup_hours = start_to_pickup_distance / 60.0
    pickup_to_dropoff_hours = pickup_to_dropoff_distance / 60.0
    
    # Total distance and time
    total_distance = start_to_pickup_distance + pickup_to_dropoff_distance
    total_hours = start_to_pickup_hours + pickup_to_dropoff_hours
    
    # Generate mock polyline for the route
    mock_route_points = generate_mock_route(start_coords, pickup_coords, dropoff_coords)
    encoded_polyline = polyline.encode(mock_route_points)
    
    # Mock city and state data
    start_city, start_state, start_zip = "Starting City", "SC", "12345"
    pickup_city, pickup_state, pickup_zip = "Pickup City", "PC", "23456"
    dropoff_city, dropoff_state, dropoff_zip = "Dropoff City", "DC", "34567"
    
    # For more accurate results in a real implementation, use Google Maps API:
    # directions_result = gmaps.directions(
    #     start_coords, 
    #     pickup_coords,
    #     dropoff_coords,
    #     waypoints=None,
    #     mode="driving",
    #     departure_time=datetime.now()
    # )
    
    # Generate fuel stops (every 500 miles)
    fuel_stops = []
    distance_covered = 0
    
    # Check if we need a fuel stop between start and pickup
    if start_to_pickup_distance > 500:
        # Calculate how many fuel stops needed
        num_stops = math.floor(start_to_pickup_distance / 500)
        for i in range(1, num_stops + 1):
            distance = i * 500
            ratio = distance / start_to_pickup_distance
            # Interpolate position
            lat = start_coords[0] + ratio * (pickup_coords[0] - start_coords[0])
            lng = start_coords[1] + ratio * (pickup_coords[1] - start_coords[1])
            
            fuel_stops.append({
                'location': {
                    'lat': lat,
                    'lng': lng,
                    'name': f"Fuel Stop #{len(fuel_stops) + 1}",
                    'city': f"City {len(fuel_stops) + 1}",
                    'state': "FS",
                    'zip': f"5{len(fuel_stops)}000"
                },
                'distance_from_start': distance,
                'estimated_time_from_start': distance / 60.0  # hours
            })
    
    # Add the distance from start to pickup
    distance_covered += start_to_pickup_distance
    
    # Check if we need a fuel stop between pickup and dropoff
    if pickup_to_dropoff_distance > 500:
        # Calculate how many fuel stops needed
        num_stops = math.floor(pickup_to_dropoff_distance / 500)
        for i in range(1, num_stops + 1):
            distance = i * 500
            ratio = distance / pickup_to_dropoff_distance
            # Interpolate position
            lat = pickup_coords[0] + ratio * (dropoff_coords[0] - pickup_coords[0])
            lng = pickup_coords[1] + ratio * (dropoff_coords[1] - pickup_coords[1])
            
            fuel_stops.append({
                'location': {
                    'lat': lat,
                    'lng': lng,
                    'name': f"Fuel Stop #{len(fuel_stops) + 1}",
                    'city': f"City {len(fuel_stops) + 1}",
                    'state': "FS",
                    'zip': f"5{len(fuel_stops)}000"
                },
                'distance_from_start': distance_covered + distance,
                'estimated_time_from_start': (distance_covered + distance) / 60.0  # hours
            })
    
    return {
        'total_distance': total_distance,
        'total_hours': total_hours,
        'start_to_pickup_distance': start_to_pickup_distance,
        'pickup_to_dropoff_distance': pickup_to_dropoff_distance,
        'polyline': encoded_polyline,
        'route_points': mock_route_points,
        'fuel_stops': fuel_stops,
        'start_city': start_city,
        'start_state': start_state,
        'start_zip': start_zip,
        'pickup_city': pickup_city,
        'pickup_state': pickup_state,
        'pickup_zip': pickup_zip,
        'dropoff_city': dropoff_city,
        'dropoff_state': dropoff_state,
        'dropoff_zip': dropoff_zip
    }


def haversine_distance(coords1, coords2):
    """
    Calculate the great-circle distance between two points on Earth
    
    Args:
        coords1: Tuple of (latitude, longitude) in decimal degrees
        coords2: Tuple of (latitude, longitude) in decimal degrees
        
    Returns:
        Distance in miles
    """
    # Convert decimal degrees to radians
    lat1, lon1 = math.radians(coords1[0]), math.radians(coords1[1])
    lat2, lon2 = math.radians(coords2[0]), math.radians(coords2[1])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 3956  # Radius of earth in miles
    
    return c * r


def generate_mock_route(start, pickup, dropoff, num_points=50):
    """
    Generate a mock route between start, pickup, and dropoff
    
    Args:
        start: Tuple of (latitude, longitude) for starting point
        pickup: Tuple of (latitude, longitude) for pickup location
        dropoff: Tuple of (latitude, longitude) for delivery location
        num_points: Number of points to generate
        
    Returns:
        List of (latitude, longitude) points for the route
    """
    route = []
    
    # Generate points between start and pickup
    for i in range(num_points // 2):
        ratio = i / (num_points // 2 - 1)
        lat = start[0] + ratio * (pickup[0] - start[0])
        lng = start[1] + ratio * (pickup[1] - start[1])
        # Add some randomness for a more realistic route
        lat += (math.random() * 0.01 - 0.005) if 0 < i < num_points // 2 - 1 else 0
        lng += (math.random() * 0.01 - 0.005) if 0 < i < num_points // 2 - 1 else 0
        route.append((lat, lng))
    
    # Generate points between pickup and dropoff
    for i in range(num_points // 2):
        ratio = i / (num_points // 2 - 1)
        lat = pickup[0] + ratio * (dropoff[0] - pickup[0])
        lng = pickup[1] + ratio * (dropoff[1] - pickup[1])
        # Add some randomness for a more realistic route
        lat += (math.random() * 0.01 - 0.005) if 0 < i < num_points // 2 - 1 else 0
        lng += (math.random() * 0.01 - 0.005) if 0 < i < num_points // 2 - 1 else 0
        route.append((lat, lng))
    
    return route