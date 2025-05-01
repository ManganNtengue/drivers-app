# eld_api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Driver, Vehicle, Location, Trip, StatusChange, LogSheet, RestStop


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class DriverSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Driver
        fields = ['id', 'user', 'license_number', 'license_state', 'company_name', 'current_cycle']


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'vehicle_number', 'license_plate', 'state', 'make', 'model', 'year', 'vin']


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'city', 'state', 'zip_code', 'latitude', 'longitude']


class RestStopSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=Location.objects.all(),
        source='location'
    )
    
    class Meta:
        model = RestStop
        fields = [
            'id', 'location', 'location_id', 'planned_arrival', 'planned_departure',
            'actual_arrival', 'actual_departure', 'stop_type'
        ]


class TripSerializer(serializers.ModelSerializer):
    starting_location = LocationSerializer(read_only=True)
    pickup_location = LocationSerializer(read_only=True)
    delivery_location = LocationSerializer(read_only=True)
    
    starting_location_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=Location.objects.all(),
        source='starting_location'
    )
    pickup_location_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=Location.objects.all(),
        source='pickup_location'
    )
    delivery_location_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=Location.objects.all(),
        source='delivery_location'
    )
    
    vehicle_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=Vehicle.objects.all(),
        source='vehicle'
    )
    vehicle = VehicleSerializer(read_only=True)
    
    rest_stops = RestStopSerializer(many=True, read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'starting_location', 'starting_location_id',
            'pickup_location', 'pickup_location_id',
            'delivery_location', 'delivery_location_id',
            'vehicle', 'vehicle_id', 'scheduled_start',
            'estimated_duration_hours', 'total_distance_miles',
            'status', 'created_at', 'rest_stops'
        ]
        read_only_fields = ['created_at', 'driver']
    
    def create(self, validated_data):
        # Assign the current driver to the trip
        user = self.context['request'].user
        driver = Driver.objects.get(user=user)
        validated_data['driver'] = driver
        return super().create(validated_data)


class StatusChangeSerializer(serializers.ModelSerializer):
    trip_id = serializers.PrimaryKeyRelatedField(
        queryset=Trip.objects.all(),
        source='trip',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = StatusChange
        fields = [
            'id', 'status', 'timestamp', 'trip_id',
            'odometer', 'remarks'
        ]
        read_only_fields = ['timestamp', 'driver']
    
    def create(self, validated_data):
        # Assign the current driver to the status change
        user = self.context['request'].user
        driver = Driver.objects.get(user=user)
        validated_data['driver'] = driver
        return super().create(validated_data)


class LogSheetSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    
    class Meta:
        model = LogSheet
        fields = [
            'id', 'driver', 'vehicle', 'trip', 'date',
            'total_miles', 'hours_off_duty', 'hours_sleeper_berth',
            'hours_driving', 'hours_on_duty', 'graph_data',
            'shipping_docs', 'remarks', 'certified', 'certified_at'
        ]
        read_only_fields = ['certified_at']


class TripPlannerSerializer(serializers.Serializer):
    """
    Serializer for trip planning inputs with current cycle used
    """
    current_location_lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    current_location_lng = serializers.DecimalField(max_digits=9, decimal_places=6)
    current_location_name = serializers.CharField(max_length=200)
    
    pickup_location_lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    pickup_location_lng = serializers.DecimalField(max_digits=9, decimal_places=6)
    pickup_location_name = serializers.CharField(max_length=200)
    
    dropoff_location_lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    dropoff_location_lng = serializers.DecimalField(max_digits=9, decimal_places=6)
    dropoff_location_name = serializers.CharField(max_length=200)
    
    current_cycle_used = serializers.IntegerField(min_value=0, max_value=70)
    vehicle_id = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all())
    scheduled_start = serializers.DateTimeField()
