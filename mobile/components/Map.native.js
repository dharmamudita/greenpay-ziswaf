import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function Map({ lat, lng, openGoogleMaps, onMapPress }) {
  return (
    <MapView
      style={{ width: '100%', height: '100%' }}
      mapType="hybrid"
      initialRegion={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      region={{
        latitude: lat,
        longitude: lng,
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
        coordinate={{ latitude: lat, longitude: lng }}
        title="Lokasi"
        onPress={openGoogleMaps ? openGoogleMaps : undefined}
      />
    </MapView>
  );
}
