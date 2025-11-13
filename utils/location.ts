import { Capacitor } from '@capacitor/core';
import type { Position } from '@capacitor/geolocation';
import { MOCK_GYMS } from '../data/gyms';

export const getCurrentPosition = async (): Promise<Position['coords']> => {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("La geolocalización solo está disponible en la app móvil.");
  }
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location !== 'granted' && permissions.coarseLocation !== 'granted') {
      const permissionStatus = await Geolocation.requestPermissions();
      if (permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted') {
        throw new Error("Has denegado el permiso de ubicación.");
      }
    }
    const position = await Geolocation.getCurrentPosition();
    return position.coords;
  } catch (error: any) {
    if (error && error.message) {
      // Re-throw specific Capacitor errors to be more informative
      throw new Error(error.message);
    }
    throw new Error("No se pudo obtener la ubicación. Asegúrate de que los servicios de localización están activados.");
  }
};

// A mock function to simulate finding nearby gyms
export const findNearbyGyms = async (coords: Position['coords']): Promise<string[]> => {
    console.log("Simulating gym search near:", coords.latitude, coords.longitude);
    // In a real app, this would make an API call. Here we just return our mock list.
    // The sorting by distance is omitted for simplicity in this mock.
    return MOCK_GYMS.map(gym => gym.name);
};
