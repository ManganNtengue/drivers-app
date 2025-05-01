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