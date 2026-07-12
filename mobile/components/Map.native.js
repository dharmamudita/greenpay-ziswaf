import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function Map({ lat, lng, openGoogleMaps, onMapPress }) {
  const numericLat = parseFloat(lat) || -5.3687;
  const numericLng = parseFloat(lng) || 105.2393;

  return (
    <MapView
      style={{ width: '100%', height: '100%' }}
      mapType="hybrid"
      initialRegion={{
        latitude: numericLat,
        longitude: numericLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      region={{
        latitude: numericLat,
        longitude: numericLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onPress={(e) => {
        if (onMapPress) {
          onMapPress(e.nativeEvent.coordinate);
        } else if (openGoogleMaps) {
          openGoogleMaps();
        }
      }}
    >
      <Marker 
        coordinate={{ latitude: numericLat, longitude: numericLng }}
        title="Lokasi"
        onPress={openGoogleMaps ? openGoogleMaps : undefined}
      />
    </MapView>
  );
}
