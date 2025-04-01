from django.db import models

# Create your models here.
from django.contrib.auth.models import User


class Driver(models.Model):
    """
    Driver model extending the base User model with additional driver-specific fields
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    license_number = models.CharField(max_length=20)
    license_state = models.CharField(max_length=2)
    company_name = models.CharField(max_length=100)
    current_cycle = models.IntegerField(default=0)  # Current hours used in the 70-hour cycle
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.license_number}"


class Vehicle(models.Model):
    """
    Commercial Motor Vehicle information
    """
    vehicle_number = models.CharField(max_length=20)
    license_plate = models.CharField(max_length=20)
    state = models.CharField(max_length=2)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    vin = models.CharField(max_length=17)
    
    def __str__(self):
        return f"{self.vehicle_number} - {self.make} {self.model} ({self.year})"


class Location(models.Model):
    """
    Represents a geographic location with coordinates and address information
    """
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    zip_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    def __str__(self):
        return f"{self.name} - {self.city}, {self.state}"


class Trip(models.Model):
    """
    Represents a planned trip with start, pickup, and delivery locations
    """
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='trips')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='trips')
    
    starting_location = models.ForeignKey(
        Location, 
        on_delete=models.CASCADE, 
        related_name='trips_as_start'
    )
    pickup_location = models.ForeignKey(
        Location, 
        on_delete=models.CASCADE, 
        related_name='trips_as_pickup'
    )
    delivery_location = models.ForeignKey(
        Location, 
        on_delete=models.CASCADE, 
        related_name='trips_as_delivery'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_start = models.DateTimeField()
    estimated_duration_hours = models.DecimalField(max_digits=5, decimal_places=2)
    total_distance_miles = models.DecimalField(max_digits=8, decimal_places=2)
    
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    
    def __str__(self):
        return f"Trip #{self.id}: {self.starting_location.city} to {self.delivery_location.city}"


class StatusChange(models.Model):
    """
    Records when a driver changes their duty status (driving, on-duty not driving, etc.)
    """
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='status_changes')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='status_changes', null=True, blank=True)
    
    STATUS_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper_berth', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty', 'On Duty (Not Driving)'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    odometer = models.IntegerField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.driver.user.username} - {self.status} at {self.timestamp}"


class LogSheet(models.Model):
    """
    Represents a daily log sheet with hours tracked
    """
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='log_sheets')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='log_sheets')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='log_sheets', null=True, blank=True)
    
    date = models.DateField()
    
    total_miles = models.DecimalField(max_digits=7, decimal_places=1)
    
    # Hours in each status
    hours_off_duty = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    hours_sleeper_berth = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    hours_driving = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    hours_on_duty = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    # Graph data will be stored as JSON
    graph_data = models.JSONField(default=dict)
    
    # Remarks and notes
    shipping_docs = models.CharField(max_length=100, blank=True)
    remarks = models.TextField(blank=True)
    
    # Certification
    certified = models.BooleanField(default=False)
    certified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['driver', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Log for {self.driver.user.username} on {self.date}"


class RestStop(models.Model):
    """
    Represents a planned or completed rest stop
    """
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='rest_stops')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='rest_stops')
    
    planned_arrival = models.DateTimeField()
    planned_departure = models.DateTimeField()
    
    actual_arrival = models.DateTimeField(null=True, blank=True)
    actual_departure = models.DateTimeField(null=True, blank=True)
    
    STOP_TYPE_CHOICES = [
        ('rest_break', '30-Minute Rest Break'),
        ('10_hour_break', '10-Hour Break'),
        ('split_sleeper', 'Split Sleeper Berth'),
        ('fuel', 'Fuel Stop'),
    ]
    stop_type = models.CharField(max_length=20, choices=STOP_TYPE_CHOICES)
    
    def __str__(self):
        return f"{self.get_stop_type_display()} at {self.location.name}"
