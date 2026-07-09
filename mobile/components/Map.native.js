import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function Map({ lat, lng, openGoogleMaps }) {
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
      onPress={openGoogleMaps}
    >
      <Marker 
        coordinate={{ latitude: lat, longitude: lng }}
        title="Bank Sampah Hijau Lestari"
        description="Jl. ZA Pagar Alam No. 45, Rajabasa"
        onPress={openGoogleMaps}
      />
    </MapView>
  );
}
