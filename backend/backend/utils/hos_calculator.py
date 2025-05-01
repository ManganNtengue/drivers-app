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