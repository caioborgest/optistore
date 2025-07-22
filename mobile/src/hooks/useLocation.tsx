import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { locationService, LocationData, GeofenceRegion, TaskLocation } from '@/services/locationService';

interface LocationContextType {
  currentLocation: LocationData | null;
  locationPermission: boolean;
  isTracking: boolean;
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  getCurrentLocation: () => Promise<LocationData | null>;
  registerCheckIn: () => Promise<boolean>;
  registerCheckOut: () => Promise<boolean>;
  addTaskLocation: (taskId: string, title: string, latitude: number, longitude: number, radius?: number) => Promise<void>;
  removeTaskLocation: (taskId: string) => Promise<void>;
  addGeofence: (geofence: GeofenceRegion) => Promise<void>;
  removeGeofence: (geofenceId: string) => Promise<void>;
  reverseGeocode: (latitude: number, longitude: number) => Promise<string | null>;
  geocode: (address: string) => Promise<LocationData | null>;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    initializeLocation();
    return () => {
      if (isTracking) {
        locationService.stopLocationTracking();
      }
    };
  }, []);

  const initializeLocation = async () => {
    // Verificar permissões
    const hasPermission = await locationService.requestPermissions();
    setLocationPermission(hasPermission);

    if (hasPermission) {
      // Carregar última localização conhecida
      const lastLocation = await locationService.getLastKnownLocation();
      if (lastLocation) {
        setCurrentLocation(lastLocation);
      }

      // Carregar geofences salvas
      await locationService.loadGeofences();

      // Obter localização atual
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    }
  };

  const startTracking = async (): Promise<boolean> => {
    if (!locationPermission) {
      const hasPermission = await locationService.requestPermissions();
      setLocationPermission(hasPermission);
      
      if (!hasPermission) {
        return false;
      }
    }

    const success = await locationService.startLocationTracking();
    setIsTracking(success);
    return success;
  };

  const stopTracking = () => {
    locationService.stopLocationTracking();
    setIsTracking(false);
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    const location = await locationService.getCurrentLocation();
    if (location) {
      setCurrentLocation(location);
    }
    return location;
  };

  const registerCheckIn = async (): Promise<boolean> => {
    const location = currentLocation || await getCurrentLocation();
    return await locationService.registerCheckIn(location || undefined);
  };

  const registerCheckOut = async (): Promise<boolean> => {
    const location = currentLocation || await getCurrentLocation();
    return await locationService.registerCheckOut(location || undefined);
  };

  const addTaskLocation = async (
    taskId: string, 
    title: string, 
    latitude: number, 
    longitude: number, 
    radius?: number
  ): Promise<void> => {
    await locationService.addTaskLocation(taskId, title, latitude, longitude, radius);
  };

  const removeTaskLocation = async (taskId: string): Promise<void> => {
    await locationService.removeTaskLocation(taskId);
  };

  const addGeofence = async (geofence: GeofenceRegion): Promise<void> => {
    await locationService.addGeofence(geofence);
  };

  const removeGeofence = async (geofenceId: string): Promise<void> => {
    await locationService.removeGeofence(geofenceId);
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    return await locationService.reverseGeocode(latitude, longitude);
  };

  const geocode = async (address: string): Promise<LocationData | null> => {
    return await locationService.geocode(address);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    return locationService.calculateDistance(lat1, lon1, lat2, lon2);
  };

  const value: LocationContextType = {
    currentLocation,
    locationPermission,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentLocation,
    registerCheckIn,
    registerCheckOut,
    addTaskLocation,
    removeTaskLocation,
    addGeofence,
    removeGeofence,
    reverseGeocode,
    geocode,
    calculateDistance,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}