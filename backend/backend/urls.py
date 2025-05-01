# eld_api/urls.py
from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import (
    DriverViewSet, VehicleViewSet, LocationViewSet, TripViewSet,
    StatusChangeViewSet, LogSheetViewSet, TripPlannerView,
    CurrentStatusView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'status-changes', StatusChangeViewSet, basename='status-change')
router.register(r'log-sheets', LogSheetViewSet, basename='log-sheet')

urlpatterns = [
    path('', include(router.urls)),
    path('trip-planner/', TripPlannerView.as_view(), name='trip-planner'),
    path('current-status/', CurrentStatusView.as_view(), name='current-status'),
    # Authentication URLs
    path('auth/', include('rest_framework.urls')),
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]


