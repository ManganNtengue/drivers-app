import React, { useEffect, useRef } from "react";

// Import the CSS file
import "../../styles/components/tripPlanner/routeMap.css";

const RouteMap = ({ tripData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      const { route_points } = tripData.route;

      // Find center point of route
      const bounds = new window.google.maps.LatLngBounds();

      const startPoint = new window.google.maps.LatLng(
        tripData.trip.starting_location.latitude,
        tripData.trip.starting_location.longitude
      );

      const pickupPoint = new window.google.maps.LatLng(
        tripData.trip.pickup_location.latitude,
        tripData.trip.pickup_location.longitude
      );

      const dropoffPoint = new window.google.maps.LatLng(
        tripData.trip.delivery_location.latitude,
        tripData.trip.delivery_location.longitude
      );

      bounds.extend(startPoint);
      bounds.extend(pickupPoint);
      bounds.extend(dropoffPoint);

      // Add rest stops to bounds
      tripData.hos_compliance.required_stops.forEach((stop) => {
        const stopPoint = new window.google.maps.LatLng(
          stop.location.lat,
          stop.location.lng
        );
        bounds.extend(stopPoint);
      });

      // Create map
      const mapOptions = {
        zoom: 5,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        },
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      map.fitBounds(bounds);
      mapInstanceRef.current = map;

      // Draw the route
      const routePath = tripData.route.route_points.map((point) => ({
        lat: point[0],
        lng: point[1],
      }));

      const routeLine = new window.google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: "#4285F4",
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      routeLine.setMap(map);

      // Add markers
      // Starting location marker
      new window.google.maps.Marker({
        position: startPoint,
        map: map,
        title: tripData.trip.starting_location.name,
        label: "S",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
      });

      // Pickup location marker
      new window.google.maps.Marker({
        position: pickupPoint,
        map: map,
        title: tripData.trip.pickup_location.name,
        label: "P",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        },
      });

      // Delivery location marker
      new window.google.maps.Marker({
        position: dropoffPoint,
        map: map,
        title: tripData.trip.delivery_location.name,
        label: "D",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      // Add rest stop markers
      tripData.hos_compliance.required_stops.forEach((stop, index) => {
        const stopPoint = new window.google.maps.LatLng(
          stop.location.lat,
          stop.location.lng
        );

        let icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        let stopLabel = "R";

        // Different icons for different stop types
        if (stop.stop_type === "rest_break") {
          icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
          stopLabel = "B";
        } else if (stop.stop_type === "10_hour_break") {
          icon = "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
          stopLabel = "R";
        } else if (stop.stop_type === "fuel") {
          icon = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
          stopLabel = "F";
        } else if (stop.stop_type === "on_duty") {
          icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
          stopLabel = "W";
        }

        const marker = new window.google.maps.Marker({
          position: stopPoint,
          map: map,
          title: stop.location.name,
          label: stopLabel,
          icon: {
            url: icon,
          },
        });

        // Add info window with details
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="width: 200px;">
              <h3 style="margin: 0; font-size: 14px; font-weight: bold;">${
                stop.location.name
              }</h3>
              <p style="margin: 5px 0; font-size: 12px;">
                <strong>Type:</strong> ${stop.stop_type.replace("_", " ")}
              </p>
              <p style="margin: 5px 0; font-size: 12px;">
                <strong>Arrival:</strong> ${new Date(
                  stop.arrival_time
                ).toLocaleString()}
              </p>
              <p style="margin: 5px 0; font-size: 12px;">
                <strong>Departure:</strong> ${new Date(
                  stop.departure_time
                ).toLocaleString()}
              </p>
              <p style="margin: 5px 0; font-size: 12px;">
                <strong>Duration:</strong> ${stop.duration_minutes} minutes
              </p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });
    }
  }, [tripData]);

  return (
    <div className="route-map-container">
      <div ref={mapRef} className="route-map" />
    </div>
  );
};

export default RouteMap;
