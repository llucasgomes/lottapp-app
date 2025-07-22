import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar sua localização.');
        return;
      }
      setLocationGranted(true);
    };

    requestPermission();
  }, []);

  if (!locationGranted) {
    return null; // ou um loading/spinner
  }

  return (
    <MapView style={{ flex: 1 }}
      styleURL="mapbox://styles/mapbox/dark-v11"
    >
      <Camera followZoomLevel={14} followUserLocation />
      <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
    </MapView>
  );
}
