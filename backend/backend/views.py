from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta, datetime

from .models import Driver, Vehicle, Location, Trip, StatusChange, LogSheet, RestStop
from .serializers import (
    DriverSerializer, VehicleSerializer, LocationSerializer, 
    TripSerializer, StatusChangeSerializer, LogSheetSerializer,
    RestStopSerializer, TripPlannerSerializer
)
from .utils.route_calculator import calculate_route
from .utils.hos_calculator import calculate_hos_compliance
from .utils.log_generator import generate_log_sheet


class DriverViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving driver information
    """
    permission_classes = [IsAuthenticated]
    serializer_class = DriverSerializer
    
    def get_queryset(self):
        # Only allow drivers to see their own profile
        user = self.request.user
        return Driver.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Endpoint to get the current driver's profile"""
        driver = Driver.objects.get(user=request.user)
        serializer = self.get_serializer(driver)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_hours(self, request):
        """Get available driving and on-duty hours for the current driver"""
        driver = Driver.objects.get(user=request.user)
        
        # Calculate hours used in last 8 days (70-hour rule)
        eight_days_ago = timezone.now() - timedelta(days=8)
        log_sheets = LogSheet.objects.filter(
            driver=driver,
            date__gte=eight_days_ago.date()
        )
        
        total_on_duty_hours = sum(
            log.hours_on_duty + log.hours_driving 
            for log in log_sheets
        )
        
        # Get current day's hours
        today = timezone.now().date()
        try:
            today_log = LogSheet.objects.get(driver=driver, date=today)
            today_drive_hours = today_log.hours_driving
            today_duty_hours = today_log.hours_on_duty + today_log.hours_driving
        except LogSheet.DoesNotExist:
            today_drive_hours = 0
            today_duty_hours = 0
        
        # Calculate available hours
        available_drive_hours = min(11 - today_drive_hours, 70 - total_on_duty_hours)
        available_duty_hours = min(14 - today_duty_hours, 70 - total_on_duty_hours)
        
        return Response({
            'available_drive_hours': max(0, available_drive_hours),
            'available_duty_hours': max(0, available_duty_hours),
            'total_cycle_hours': min(70, total_on_duty_hours),
            'today_drive_hours': today_drive_hours,
            'today_duty_hours': today_duty_hours
        })


class VehicleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving vehicle information
    """
    permission_classes = [IsAuthenticated]
    serializer_class = VehicleSerializer
    queryset = Vehicle.objects.all()


class LocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on locations
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LocationSerializer
    queryset = Location.objects.all()
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search locations by name, city, or state"""
        query = request.query_params.get('q', '')
        if not query:
            return Response([], status=status.HTTP_200_OK)
        
        locations = Location.objects.filter(
            Q(name__icontains=query) | 
            Q(city__icontains=query) | 
            Q(state__icontains=query)
        )[:10]  # Limit to 10 results
        
        serializer = self.get_serializer(locations, many=True)
        return Response(serializer.data)


class TripViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on trips
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TripSerializer
    
    def get_queryset(self):
        user = self.request.user
        driver = Driver.objects.get(user=user)
        return Trip.objects.filter(driver=driver).order_by('-created_at')
    
    @action(detail=True, methods=['get'])
    def rest_stops(self, request, pk=None):
        """Get all rest stops for a specific trip"""
        trip = self.get_object()
        rest_stops = RestStop.objects.filter(trip=trip)
        serializer = RestStopSerializer(rest_stops, many=True)
        return Response(serializer.data)


class StatusChangeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on driver status changes
    """
    permission_classes = [IsAuthenticated]
    serializer_class = StatusChangeSerializer
    
    def get_queryset(self):
        user = self.request.user
        driver = Driver.objects.get(user=user)
        
        # Filter by date if provided
        date_str = self.request.query_params.get('date')
        if date_str:
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                start_datetime = timezone.make_aware(datetime.combine(date, datetime.min.time()))
                end_datetime = timezone.make_aware(datetime.combine(date, datetime.max.time()))
                return StatusChange.objects.filter(
                    driver=driver,
                    timestamp__range=(start_datetime, end_datetime)
                )
            except ValueError:
                pass
        
        # Default to last 24 hours
        one_day_ago = timezone.now() - timedelta(days=1)
        return StatusChange.objects.filter(
            driver=driver,
            timestamp__gte=one_day_ago
        )
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the current status of the driver"""
        user = request.user
        driver = Driver.objects.get(user=user)
        
        # Get the most recent status change
        try:
            latest_status = StatusChange.objects.filter(driver=driver).latest('timestamp')
            serializer = self.get_serializer(latest_status)
            
            # Calculate duration in current status
            duration = timezone.now() - latest_status.timestamp
            hours = duration.total_seconds() / 3600
            
            response_data = serializer.data
            response_data['duration_hours'] = round(hours, 2)
            
            return Response(response_data)
        except StatusChange.DoesNotExist:
            return Response(
                {"status": "unknown", "message": "No status records found"},
                status=status.HTTP_404_NOT_FOUND
            )


class LogSheetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving log sheets
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LogSheetSerializer
    
    def get_queryset(self):
        user = self.request.user
        driver = Driver.objects.get(user=user)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        queryset = LogSheet.objects.filter(driver=driver)
        
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=start)
            except ValueError:
                pass
        
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=end)
            except ValueError:
                pass
        
        return queryset.order_by('-date')
    
    @action(detail=True, methods=['post'])
    def certify(self, request, pk=None):
        """Allow driver to certify a log sheet"""
        log_sheet = self.get_object()
        log_sheet.certified = True
        log_sheet.certified_at = timezone.now()
        log_sheet.save()
        
        serializer = self.get_serializer(log_sheet)
        return Response(serializer.data)


class TripPlannerView(APIView):
    """
    View for planning a trip with HOS compliance
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = TripPlannerSerializer(data=request.data)
        if serializer.is_valid():
            # Get current driver
            driver = Driver.objects.get(user=request.user)
            
            # Extract data from serializer
            data = serializer.validated_data
            
            # Calculate the route
            route_result = calculate_route(
                start_coords=(data['current_location_lat'], data['current_location_lng']),
                pickup_coords=(data['pickup_location_lat'], data['pickup_location_lng']),
                dropoff_coords=(data['dropoff_location_lat'], data['dropoff_location_lng'])
            )
            
            # Calculate HOS compliance
            hos_result = calculate_hos_compliance(
                route_data=route_result,
                current_cycle_hours=data['current_cycle_used'],
                scheduled_start=data['scheduled_start']
            )
            
            # Generate log sheets for the trip
            log_sheets = generate_log_sheet(
                driver=driver,
                vehicle=data['vehicle_id'],
                hos_data=hos_result,
                scheduled_start=data['scheduled_start']
            )
            
            # Create locations if they don't exist
            current_location, _ = Location.objects.get_or_create(
                latitude=data['current_location_lat'],
                longitude=data['current_location_lng'],
                defaults={
                    'name': data['current_location_name'],
                    'address': data['current_location_name'],
                    'city': route_result['start_city'],
                    'state': route_result['start_state'],
                    'zip_code': route_result['start_zip'],
                }
            )
            
            pickup_location, _ = Location.objects.get_or_create(
                latitude=data['pickup_location_lat'],
                longitude=data['pickup_location_lng'],
                defaults={
                    'name': data['pickup_location_name'],
                    'address': data['pickup_location_name'],
                    'city': route_result['pickup_city'],
                    'state': route_result['pickup_state'],
                    'zip_code': route_result['pickup_zip'],
                }
            )
            
            dropoff_location, _ = Location.objects.get_or_create(
                latitude=data['dropoff_location_lat'],
                longitude=data['dropoff_location_lng'],
                defaults={
                    'name': data['dropoff_location_name'],
                    'address': data['dropoff_location_name'],
                    'city': route_result['dropoff_city'],
                    'state': route_result['dropoff_state'],
                    'zip_code': route_result['dropoff_zip'],
                }
            )
            
            # Create the trip
            trip = Trip.objects.create(
                driver=driver,
                vehicle=data['vehicle_id'],
                starting_location=current_location,
                pickup_location=pickup_location,
                delivery_location=dropoff_location,
                scheduled_start=data['scheduled_start'],
                estimated_duration_hours=route_result['total_hours'],
                total_distance_miles=route_result['total_distance'],
                status='planned'
            )
            
            # Create rest stops
            for stop_data in hos_result['required_stops']:
                stop_location, _ = Location.objects.get_or_create(
                    latitude=stop_data['location']['lat'],
                    longitude=stop_data['location']['lng'],
                    defaults={
                        'name': stop_data['location']['name'],
                        'address': stop_data['location']['name'],
                        'city': stop_data['location']['city'],
                        'state': stop_data['location']['state'],
                        'zip_code': stop_data['location']['zip'],
                    }
                )
                
                RestStop.objects.create(
                    trip=trip,
                    location=stop_location,
                    planned_arrival=stop_data['arrival_time'],
                    planned_departure=stop_data['departure_time'],
                    stop_type=stop_data['stop_type']
                )
            
            # Return the complete trip plan with rest stops
            trip_serializer = TripSerializer(trip)
            
            response_data = {
                'trip': trip_serializer.data,
                'route': route_result,
                'hos_compliance': hos_result,
                'log_sheets': [sheet.id for sheet in log_sheets]
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentStatusView(APIView):
    """
    View for updating the current status of a driver
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current status and hours information"""
        driver = Driver.objects.get(user=request.user)
        
        # Get current status
        try:
            current_status = StatusChange.objects.filter(driver=driver).latest('timestamp')
            status_name = current_status.status
            status_time = current_status.timestamp
            duration = timezone.now() - status_time
            hours_in_status = duration.total_seconds() / 3600
        except StatusChange.DoesNotExist:
            status_name = "unknown"
            status_time = None
            hours_in_status = 0
        
        # Calculate daily and weekly hours
        today = timezone.now().date()
        try:
            today_log = LogSheet.objects.get(driver=driver, date=today)
            drive_hours_today = today_log.hours_driving
            duty_hours_today = today_log.hours_on_duty + today_log.hours_driving
        except LogSheet.DoesNotExist:
            drive_hours_today = 0
            duty_hours_today = 0
        
        # Calculate weekly hours (70-hour rule)
        eight_days_ago = timezone.now() - timedelta(days=8)
        log_sheets = LogSheet.objects.filter(
            driver=driver,
            date__gte=eight_days_ago.date()
        )
        
        cycle_hours = sum(log.hours_on_duty + log.hours_driving for log in log_sheets)
        
        # Calculate available hours
        available_drive_hours = min(11 - drive_hours_today, 70 - cycle_hours)
        available_duty_hours = min(14 - duty_hours_today, 70 - cycle_hours)
        
        response_data = {
            'current_status': status_name,
            'status_timestamp': status_time,
            'hours_in_current_status': round(hours_in_status, 2),
            'drive_hours_today': drive_hours_today,
            'duty_hours_today': duty_hours_today,
            'cycle_hours': cycle_hours,
            'available_drive_hours': max(0, available_drive_hours),
            'available_duty_hours': max(0, available_duty_hours),
            'drive_hours_remaining': max(0, 11 - drive_hours_today),
            'duty_hours_remaining': max(0, 14 - duty_hours_today),
            'cycle_hours_remaining': max(0, 70 - cycle_hours),
        }
        
        # Check if 30-minute break is needed
        if drive_hours_today >= 8 and status_name != 'driving':
            # If driven 8+ hours and not currently in driving status
            last_break = StatusChange.objects.filter(
                driver=driver,
                status__in=['off_duty', 'sleeper_berth', 'on_duty'],
                timestamp__gte=timezone.now() - timedelta(hours=8)
            ).order_by('-timestamp').first()
            
            if last_break:
                response_data['break_status'] = 'compliant'
            else:
                response_data['break_status'] = 'required'
        elif drive_hours_today >= 8:
            response_data['break_status'] = 'required'
        else:
            response_data['break_status'] = 'not_required'
            response_data['drive_hours_until_break'] = 8 - drive_hours_today
        
        return Response(response_data)
    
    def post(self, request):
        """Update driver status"""
        status_data = request.data.get('status')
        if not status_data or status_data not in dict(StatusChange.STATUS_CHOICES).keys():
            return Response(
                {"error": "Valid status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        driver = Driver.objects.get(user=request.user)
        
        # Get optional fields
        remarks = request.data.get('remarks', '')
        odometer = request.data.get('odometer')
        trip_id = request.data.get('trip_id')
        
        # Create the new status change
        status_change_data = {
            'driver': driver,
            'status': status_data,
            'remarks': remarks
        }
        
        if odometer is not None:
            status_change_data['odometer'] = odometer
            
        if trip_id:
            try:
                trip = Trip.objects.get(id=trip_id)
                status_change_data['trip'] = trip
            except Trip.DoesNotExist:
                pass
        
        status_change = StatusChange.objects.create(**status_change_data)
        
        # Update the log sheet for today
        today = timezone.now().date()
        
        # Get or create today's log sheet
        try:
            log_sheet = LogSheet.objects.get(driver=driver, date=today)
        except LogSheet.DoesNotExist:
            # Create a new log sheet for today
            vehicle = None
            if trip_id:
                try:
                    trip = Trip.objects.get(id=trip_id)
                    vehicle = trip.vehicle
                except Trip.DoesNotExist:
                    # Get the most recent vehicle used
                    recent_log = LogSheet.objects.filter(driver=driver).order_by('-date').first()
                    if recent_log:
                        vehicle = recent_log.vehicle
            
            if not vehicle:
                # Fallback to any vehicle
                vehicle = Vehicle.objects.first()
            
            log_sheet = LogSheet.objects.create(
                driver=driver,
                vehicle=vehicle,
                date=today,
                total_miles=0
            )
        
        # Update log sheet with new status information
        self._update_log_sheet_for_status_change(log_sheet, status_change)
        
        # Return the updated status and hours
        serializer = StatusChangeSerializer(status_change)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def _update_log_sheet_for_status_change(self, log_sheet, status_change):
        """Update log sheet with the new status information"""
        # Get previous status change
        previous = StatusChange.objects.filter(
            driver=status_change.driver,
            timestamp__lt=status_change.timestamp
        ).order_by('-timestamp').first()
        
        if previous:
            # Calculate duration of previous status
            duration = status_change.timestamp - previous.timestamp
            hours = duration.total_seconds() / 3600
            
            # Update the appropriate hours field
            if previous.status == 'off_duty':
                log_sheet.hours_off_duty += hours
            elif previous.status == 'sleeper_berth':
                log_sheet.hours_sleeper_berth += hours
            elif previous.status == 'driving':
                log_sheet.hours_driving += hours
            elif previous.status == 'on_duty':
                log_sheet.hours_on_duty += hours
        
        # Update graph data
        if 'status_changes' not in log_sheet.graph_data:
            log_sheet.graph_data['status_changes'] = []
        
        log_sheet.graph_data['status_changes'].append({
            'status': status_change.status,
            'timestamp': status_change.timestamp.isoformat(),
            'remarks': status_change.remarks
        })
        
        log_sheet.save()
        
        # Update driver's current cycle hours
        driver = status_change.driver
        eight_days_ago = timezone.now() - timedelta(days=8)
        log_sheets = LogSheet.objects.filter(
            driver=driver,
            date__gte=eight_days_ago.date()
        )
        
        cycle_hours = sum(log.hours_on_duty + log.hours_driving for log in log_sheets)
        driver.current_cycle = cycle_hours
        driver.save()
