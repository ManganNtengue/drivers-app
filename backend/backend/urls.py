from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Trucker ELD API",
      default_version='v1',
      description="API for Trucker Electronic Logging Device application",
      contact=openapi.Contact(email="admin@truckereld.com"),
      license=openapi.License(name="MIT License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('eld_api.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]


# eld_api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DriverViewSet, VehicleViewSet, LocationViewSet, TripViewSet,
    StatusChangeViewSet, LogSheetViewSet, TripPlannerView,
    CurrentStatusView
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
]
