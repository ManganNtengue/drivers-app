import React, { useState, useEffect } from "react";
import { fetchVehicles } from "../../api/vehicles";
import { fetchDriverInfo } from "../../api/status";
import PlacesAutocomplete from "./PlacesAutocomplete";

// Import the CSS file
import "../../styles/components/tripPlanner/tripForm.css";

const TripForm = ({ onPlanTrip }) => {
  const [vehicles, setVehicles] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    currentLocation: null,
    pickupLocation: null,
    dropoffLocation: null,
    vehicleId: "",
    scheduledStart: "",
    currentCycleUsed: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, driverData] = await Promise.all([
          fetchVehicles(),
          fetchDriverInfo(),
        ]);

        setVehicles(vehiclesData);
        setDriverInfo(driverData);

        // Set default cycle hours from driver info
        if (driverData?.current_cycle) {
          setFormData((prev) => ({
            ...prev,
            currentCycleUsed: driverData.current_cycle,
          }));
        }

        // Set default vehicle if only one available
        if (vehiclesData.length === 1) {
          setFormData((prev) => ({
            ...prev,
            vehicleId: vehiclesData[0].id,
          }));
        }

        // Set default scheduled start time to next hour
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1);
        nextHour.setMinutes(0);
        nextHour.setSeconds(0);

        setFormData((prev) => ({
          ...prev,
          scheduledStart: nextHour.toISOString().slice(0, 16),
        }));
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (type, location) => {
    setFormData((prev) => ({
      ...prev,
      [type]: location,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.currentLocation ||
      !formData.pickupLocation ||
      !formData.dropoffLocation
    ) {
      alert("Please select all locations");
      return;
    }

    if (!formData.vehicleId) {
      alert("Please select a vehicle");
      return;
    }

    if (!formData.scheduledStart) {
      alert("Please select a scheduled start time");
      return;
    }

    // Convert to API format
    const tripData = {
      current_location_lat: formData.currentLocation.lat,
      current_location_lng: formData.currentLocation.lng,
      current_location_name: formData.currentLocation.description,

      pickup_location_lat: formData.pickupLocation.lat,
      pickup_location_lng: formData.pickupLocation.lng,
      pickup_location_name: formData.pickupLocation.description,

      dropoff_location_lat: formData.dropoffLocation.lat,
      dropoff_location_lng: formData.dropoffLocation.lng,
      dropoff_location_name: formData.dropoffLocation.description,

      vehicle_id: formData.vehicleId,
      scheduled_start: new Date(formData.scheduledStart).toISOString(),
      current_cycle_used: Number(formData.currentCycleUsed),
    };

    onPlanTrip(tripData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="trip-form">
      <div className="trip-info-box">
        <h3 className="trip-info-title">Trip Planning Instructions</h3>
        <p className="trip-info-text">
          Plan your trip by entering your current location, pickup, and delivery
          points. The system will:
        </p>
        <ul className="trip-info-list">
          <li>Calculate optimal routes based on HOS regulations</li>
          <li>Schedule required rest breaks and fuel stops</li>
          <li>Generate compliant electronic logs for your trip</li>
          <li>
            Account for your current cycle hours:{" "}
            {driverInfo?.current_cycle || 0} of 70 hours used
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="location-field">Current Location</label>
          <PlacesAutocomplete
            onSelect={(location) =>
              handleLocationSelect("currentLocation", location)
            }
            placeholder="Enter your current location"
          />
          {formData.currentLocation && (
            <div className="location-selected">
              Selected: {formData.currentLocation.description}
            </div>
          )}
        </div>

        <div>
          <label className="location-field">Pickup Location</label>
          <PlacesAutocomplete
            onSelect={(location) =>
              handleLocationSelect("pickupLocation", location)
            }
            placeholder="Enter pickup location"
          />
          {formData.pickupLocation && (
            <div className="location-selected">
              Selected: {formData.pickupLocation.description}
            </div>
          )}
        </div>

        <div>
          <label className="location-field">Delivery Location</label>
          <PlacesAutocomplete
            onSelect={(location) =>
              handleLocationSelect("dropoffLocation", location)
            }
            placeholder="Enter delivery location"
          />
          {formData.dropoffLocation && (
            <div className="location-selected">
              Selected: {formData.dropoffLocation.description}
            </div>
          )}
        </div>

        <div>
          <label className="vehicle-field">Vehicle</label>
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className="vehicle-select"
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicle_number} - {vehicle.make} {vehicle.model} (
                {vehicle.year})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="time-field">Scheduled Start Time</label>
          <input
            type="datetime-local"
            name="scheduledStart"
            value={formData.scheduledStart}
            onChange={handleChange}
            className="time-input"
          />
        </div>

        <div>
          <label className="hours-field">Current Cycle Hours Used (0-70)</label>
          <input
            type="number"
            name="currentCycleUsed"
            value={formData.currentCycleUsed}
            onChange={handleChange}
            min="0"
            max="70"
            step="0.5"
            className="hours-input"
          />
          <p className="hours-help">
            Enter the hours you've already used in your 70-hour cycle
          </p>
        </div>
      </div>

      <div className="form-actions">
        <div className="flex justify-end">
          <button type="submit" className="form-submit-button">
            Calculate Trip Plan
          </button>
        </div>
      </div>
    </form>
  );
};

export default TripForm;
