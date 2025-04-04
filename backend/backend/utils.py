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


# eld_api/utils/hos_calculator.py
from datetime import datetime, timedelta
import math

def calculate_hos_compliance(route_data, current_cycle_hours, scheduled_start):
    """
    Calculate HOS compliance for a given route
    
    Args:
        route_data: Dictionary with route details from calculate_route
        current_cycle_hours: Current hours used in the 70-hour cycle
        scheduled_start: Datetime for the scheduled trip start
        
    Returns:
        Dictionary with HOS compliance details
    """
    # Initialize variables
    total_distance = route_data['total_distance']
    total_hours = route_data['total_hours']
    
    # Add 1 hour for pickup and 1 hour for delivery
    total_duty_hours = total_hours + 2
    
    # Get fuel stops
    fuel_stops = route_data['fuel_stops']
    
    # Initialize the current state
    current_time = scheduled_start
    drive_hours_available = 11  # 11-hour driving limit
    duty_hours_available = 14   # 14-hour duty limit
    cycle_hours_available = 70 - current_cycle_hours  # 70-hour cycle limit
    
    # Track accumulated hours
    hours_driven = 0
    hours_on_duty = 0
    
    # Track required stops
    required_stops = []
    current_location = {
        'lat': route_data['route_points'][0][0],
        'lng': route_data['route_points'][0][1],
        'name': 'Starting Location',
        'city': route_data['start_city'],
        'state': route_data['start_state'],
        'zip': route_data['start_zip']
    }
    
    # Track when a 30-minute break is required (after 8 driving hours)
    drive_hours_since_break = 0
    
    # Track the trip segments
    segments = []
    
    # Start with pickup
    pickup_distance = route_data['start_to_pickup_distance']
    pickup_driving_hours = pickup_distance / 60.0
    
    # Check if we can make it to pickup without a break
    if drive_hours_since_break + pickup_driving_hours > 8:
        # Need a 30-minute break before pickup
        driving_until_break = 8 - drive_hours_since_break
        distance_to_break = driving_until_break * 60.0
        
        # Calculate break location (interpolate along the route)
        ratio = distance_to_break / pickup_distance
        break_lat = current_location['lat'] + ratio * (route_data['route_points'][len(route_data['route_points']) // 2][0] - current_location['lat'])
        break_lng = current_location['lng'] + ratio * (route_data['route_points'][len(route_data['route_points']) // 2][1] - current_location['lng'])
        
        break_location = {
            'lat': break_lat,
            'lng': break_lng,
            'name': 'Required 30-Minute Break',
            'city': 'En Route',
            'state': 'to Pickup',
            'zip': '00000'
        }
        
        # Add the segment to pickup
        segments.append({
            'from': current_location,
            'to': break_location,
            'distance': distance_to_break,
            'drive_hours': driving_until_break,
            'start_time': current_time,
            'end_time': current_time + timedelta(hours=driving_until_break)
        })
        
        # Update current state
        current_time = current_time + timedelta(hours=driving_until_break)
        hours_driven += driving_until_break
        hours_on_duty += driving_until_break
        drive_hours_available -= driving_until_break
        duty_hours_available -= driving_until_break
        cycle_hours_available -= driving_until_break
        drive_hours_since_break = 0  # Reset after break
        current_location = break_location
        
        # Add the break
        break_end_time = current_time + timedelta(minutes=30)
        required_stops.append({
            'location': break_location,
            'arrival_time': current_time,
            'departure_time': break_end_time,
            'stop_type': 'rest_break',
            'duration_minutes': 30
        })
        
        # Update current time after break
        current_time = break_end_time
        duty_hours_available -= 0.5  # 30 minutes
        
        # Add the remaining segment to pickup
        remaining_distance = pickup_distance - distance_to_break
        remaining_drive_hours = remaining_distance / 60.0
        
        pickup_location = {
            'lat': route_data['route_points'][len(route_data['route_points']) // 2][0],
            'lng': route_data['route_points'][len(route_data['route_points']) // 2][1],
            'name': 'Pickup Location',
            'city': route_data['pickup_city'],
            'state': route_data['pickup_state'],
            'zip': route_data['pickup_zip']
        }
        
        segments.append({
            'from': break_location,
            'to': pickup_location,
            'distance': remaining_distance,
            'drive_hours': remaining_drive_hours,
            'start_time': current_time,
            'end_time': current_time + timedelta(hours=remaining_drive_hours)
        })
        
        # Update current state
        current_time = current_time + timedelta(hours=remaining_drive_hours)
        hours_driven += remaining_drive_hours
        hours_on_duty += remaining_drive_hours
        drive_hours_available -= remaining_drive_hours
        duty_hours_available -= remaining_drive_hours
        cycle_hours_available -= remaining_drive_hours
        drive_hours_since_break += remaining_drive_hours
        current_location = pickup_location
    else:
        # Can drive straight to pickup
        pickup_location = {
            'lat': route_data['route_points'][len(route_data['route_points']) // 2][0],
            'lng': route_data['route_points'][len(route_data['route_points']) // 2][1],
            'name': 'Pickup Location',
            'city': route_data['pickup_city'],
            'state': route_data['pickup_state'],
            'zip': route_data['pickup_zip']
        }
        
        segments.append({
            'from': current_location,
            'to': pickup_location,
            'distance': pickup_distance,
            'drive_hours': pickup_driving_hours,
            'start_time': current_time,
            'end_time': current_time + timedelta(hours=pickup_driving_hours)
        })
        
        # Update current state
        current_time = current_time + timedelta(hours=pickup_driving_hours)
        hours_driven += pickup_driving_hours
        hours_on_duty += pickup_driving_hours
        drive_hours_available -= pickup_driving_hours
        duty_hours_available -= pickup_driving_hours
        cycle_hours_available -= pickup_driving_hours
        drive_hours_since_break += pickup_driving_hours
        current_location = pickup_location
    
    # Add 1 hour for pickup activities
    pickup_end_time = current_time + timedelta(hours=1)
    required_stops.append({
        'location': pickup_location,
        'arrival_time': current_time,
        'departure_time': pickup_end_time,
        'stop_type': 'on_duty',
        'duration_minutes': 60
    })
    
    # Update current time after pickup
    current_time = pickup_end_time
    hours_on_duty += 1
    duty_hours_available -= 1
    cycle_hours_available -= 1
    
    # Next, handle delivery
    dropoff_distance = route_data['pickup_to_dropoff_distance']
    dropoff_driving_hours = dropoff_distance / 60.0
    
    # Check if we can make it to dropoff with current HOS limits
    if drive_hours_since_break + dropoff_driving_hours > 8:
        # Need a 30-minute break before dropoff
        driving_until_break = 8 - drive_hours_since_break
        distance_to_break = driving_until_break * 60.0
        
        # Calculate break location (interpolate along the route)
        ratio = distance_to_break / dropoff_distance
        break_lat = current_location['lat'] + ratio * (route_data['route_points'][-1][0] - current_location['lat'])
        break_lng = current_location['lng'] + ratio * (route_data['route_points'][-1][1] - current_location['lng'])
        
        break_location = {
            'lat': break_lat,
            'lng': break_lng,
            'name': 'Required 30-Minute Break',
            'city': 'En Route',
            'state': 'to Delivery',
            'zip': '00000'
        }
        
        # Add the segment to break
        segments.append({
            'from': current_location,
            'to': break_location,
            'distance': distance_to_break,
            'drive_hours': driving_until_break,
            'start_time': current_time,
            'end_time': current_time + timedelta(hours=driving_until_break)
        })
        
        # Update current state
        current_time = current_time + timedelta(hours=driving_until_break)
        hours_driven += driving_until_break
        hours_on_duty += driving_until_break
        drive_hours_available -= driving_until_break
        duty_hours_available -= driving_until_break
        cycle_hours_available -= driving_until_break
        drive_hours_since_break = 0  # Reset after break
        current_location = break_location
        
        # Add the break
        break_end_time = current_time + timedelta(minutes=30)
        required_stops.append({
            'location': break_location,
            'arrival_time': current_time,
            'departure_time': break_end_time,
            'stop_type': 'rest_break',
            'duration_minutes': 30
        })
        
        # Update current time after break
        current_time = break_end_time
        duty_hours_available -= 0.5  # 30 minutes
        
        # Check if we need a 10-hour break due to 14-hour rule
        if duty_hours_available < 0 or drive_hours_available < (dropoff_distance - distance_to_break) / 60.0:
            # Need a 10-hour break
            ten_hour_break_end = current_time + timedelta(hours=10)
            required_stops.append({
                'location': break_location,
                'arrival_time': current_time,
                'departure_time': ten_hour_break_end,
                'stop_type': '10_hour_break',
                'duration_minutes': 600  # 10 hours
            })
            
            # Reset hours after 10-hour break
            current_time = ten_hour_break_end
            drive_hours_available = 11
            duty_hours_available = 14
            # Cycle hours are not reset
        
        # Add the remaining segment to dropoff
        remaining_distance = dropoff_distance - distance_to_break
        remaining_drive_hours = remaining_distance / 60.0
        
        dropoff_location = {
            'lat': route_data['route_points'][-1][0],
            'lng': route_data['route_points'][-1][1],
            'name': 'Delivery Location',
            'city': route_data['dropoff_city'],
            'state': route_data['dropoff_state'],
            'zip': route_data['dropoff_zip']
        }
        
        segments.append({
            'from': break_location,
            'to': dropoff_location,
            'distance': remaining_distance,
            'drive_hours': remaining_drive_hours,
            'start_time': current_time,
            'end_time': current_time + timedelta(hours=remaining_drive_hours)
        })
        
        # Update current state
        current_time = current_time + timedelta(hours=remaining_drive_hours)
        hours_driven += remaining_drive_hours
        hours_on_duty += remaining_drive_hours
        drive_hours_available -= remaining_drive_hours
        duty_hours_available -= remaining_drive_hours
        cycle_hours_available -= remaining_drive_hours
        drive_hours_since_break += remaining_drive_hours
    else:
        # Can drive straight to dropoff
        dropoff_location = {
            'lat': route_data['route_points'][-1][0],
            'lng': route_data['route_points'][-1][1],
            'name': 'Delivery Location',
            'city': route_data['dropoff_city'],
            'state': route_data['dropoff_state'],
            'zip':            route_data['dropoff_zip']
        }
        
        segments.append({
            'from': current_location,
            'to': dropoff_location,
            'distance': dropoff_distance,
            'drive_hours': dropoff_driving_hours,
            'start_time': current_time,
            'end_time': current_time + timedelta(hours=dropoff_driving_hours)
        })
        
        # Update current state
        current_time = current_time + timedelta(hours=dropoff_driving_hours)
        hours_driven += dropoff_driving_hours
        hours_on_duty += dropoff_driving_hours
        drive_hours_available -= dropoff_driving_hours
        duty_hours_available -= dropoff_driving_hours
        cycle_hours_available -= dropoff_driving_hours
        drive_hours_since_break += dropoff_driving_hours
    
    # Add 1 hour for delivery activities
    dropoff_end_time = current_time + timedelta(hours=1)
    required_stops.append({
        'location': dropoff_location,
        'arrival_time': current_time,
        'departure_time': dropoff_end_time,
        'stop_type': 'on_duty',
        'duration_minutes': 60
    })
    
    # Update final hours
    hours_on_duty += 1
    duty_hours_available -= 1
    cycle_hours_available -= 1
    
    # Add any required fuel stops
    for fuel_stop in fuel_stops:
        # Add a fuel stop
        required_stops.append({
            'location': fuel_stop['location'],
            'arrival_time': scheduled_start + timedelta(hours=fuel_stop['estimated_time_from_start']),
            'departure_time': scheduled_start + timedelta(hours=fuel_stop['estimated_time_from_start'] + 0.5),
            'stop_type': 'fuel',
            'duration_minutes': 30  # 30 minutes for fueling
        })
    
    # Sort required stops by arrival time
    required_stops.sort(key=lambda x: x['arrival_time'])
    
    return {
        'compliant': True,  # This would be calculated based on all HOS rules
        'total_drive_hours': hours_driven,
        'total_duty_hours': hours_on_duty,
        'remaining_drive_hours': drive_hours_available,
        'remaining_duty_hours': duty_hours_available,
        'remaining_cycle_hours': cycle_hours_available,
        'required_stops': required_stops,
        'segments': segments,
        'start_time': scheduled_start,
        'end_time': dropoff_end_time,
        'total_duration': (dropoff_end_time - scheduled_start).total_seconds() / 3600
    }


# eld_api/utils/log_generator.py
from datetime import datetime, timedelta
from ..models import LogSheet

def generate_log_sheet(driver, vehicle, hos_data, scheduled_start):
    """
    Generate log sheets for a trip based on HOS compliance data
    
    Args:
        driver: Driver model instance
        vehicle: Vehicle model instance
        hos_data: Dictionary with HOS compliance details from calculate_hos_compliance
        scheduled_start: Datetime for the scheduled trip start
        
    Returns:
        List of created LogSheet instances
    """
    # Get start and end dates for the trip
    start_date = scheduled_start.date()
    end_date = hos_data['end_time'].date()
    
    # Calculate the number of days for the trip
    trip_days = (end_date - start_date).days + 1
    
    # Create log sheets for each day
    log_sheets = []
    
    for day_offset in range(trip_days):
        current_date = start_date + timedelta(days=day_offset)
        
        # Calculate the on-duty and driving hours for this day
        day_start = max(scheduled_start, datetime.combine(current_date, datetime.min.time()))
        day_end = min(hos_data['end_time'], datetime.combine(current_date, datetime.max.time()))
        
        # Find segments and stops for this day
        day_segments = [s for s in hos_data['segments'] if 
                       s['start_time'].date() <= current_date <= s['end_time'].date()]
        
        day_stops = [s for s in hos_data['required_stops'] if 
                    s['arrival_time'].date() <= current_date <= s['departure_time'].date()]
        
        # Calculate hours in each status for this day
        hours_driving = 0
        hours_on_duty = 0
        hours_off_duty = 0
        hours_sleeper_berth = 0
        
        # Calculate driving and on-duty hours from segments
        for segment in day_segments:
            segment_start = max(segment['start_time'], day_start)
            segment_end = min(segment['end_time'], day_end)
            
            if segment_start < segment_end:
                segment_hours = (segment_end - segment_start).total_seconds() / 3600
                hours_driving += segment_hours
        
        # Calculate hours from stops
        for stop in day_stops:
            stop_start = max(stop['arrival_time'], day_start)
            stop_end = min(stop['departure_time'], day_end)
            
            if stop_start < stop_end:
                stop_hours = (stop_end - stop_start).total_seconds() / 3600
                
                if stop['stop_type'] == 'rest_break':
                    hours_off_duty += stop_hours
                elif stop['stop_type'] == '10_hour_break':
                    hours_sleeper_berth += stop_hours
                elif stop['stop_type'] == 'on_duty':
                    hours_on_duty += stop_hours
                elif stop['stop_type'] == 'fuel':
                    hours_on_duty += stop_hours
        
        # Calculate total miles for the day
        total_miles = sum(s['distance'] for s in day_segments 
                          if s['start_time'].date() <= current_date <= s['end_time'].date())
        
        # Prepare graph data
        graph_data = {
            'day_segments': day_segments,
            'day_stops': day_stops,
            'status_changes': []
        }
        
        # Create status changes for the graph
        current_time = day_start
        
        # Add initial off-duty status if needed
        if current_time == datetime.combine(current_date, datetime.min.time()):
            graph_data['status_changes'].append({
                'status': 'off_duty',
                'timestamp': current_time.isoformat(),
                'remarks': 'Start of day'
            })
        
        # Add status changes for segments and stops
        for segment in sorted(day_segments, key=lambda x: x['start_time']):
            if segment['start_time'] > current_time and segment['start_time'].date() == current_date:
                graph_data['status_changes'].append({
                    'status': 'driving',
                    'timestamp': segment['start_time'].isoformat(),
                    'remarks': f"Driving from {segment['from']['name']} to {segment['to']['name']}"
                })
                current_time = segment['start_time']
            
            if segment['end_time'] > current_time and segment['end_time'].date() == current_date:
                # Find if there's a stop at this location
                related_stop = next((s for s in day_stops if 
                                   s['arrival_time'] == segment['end_time']), None)
                
                if related_stop:
                    status = 'on_duty'
                    if related_stop['stop_type'] == 'rest_break':
                        status = 'off_duty'
                    elif related_stop['stop_type'] == '10_hour_break':
                        status = 'sleeper_berth'
                    
                    graph_data['status_changes'].append({
                        'status': status,
                        'timestamp': related_stop['arrival_time'].isoformat(),
                        'remarks': f"Stop at {related_stop['location']['name']}"
                    })
                    
                    if related_stop['departure_time'].date() == current_date:
                        current_time = related_stop['departure_time']
                else:
                    # No stop, just end of driving segment
                    current_time = segment['end_time']
        
        # Create the log sheet
        log_sheet = LogSheet.objects.create(
            driver=driver,
            vehicle=vehicle,
            date=current_date,
            total_miles=total_miles,
            hours_driving=round(hours_driving, 2),
            hours_on_duty=round(hours_on_duty, 2),
            hours_off_duty=round(hours_off_duty, 2),
            hours_sleeper_berth=round(hours_sleeper_berth, 2),
            graph_data=graph_data
        )
        
        log_sheets.append(log_sheet)
    
    return log_sheets
