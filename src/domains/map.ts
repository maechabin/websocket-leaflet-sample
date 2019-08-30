import L from 'leaflet';
import { number } from 'prop-types';

declare module 'leaflet' {
  interface LeafletEvent {
    latlng: LatLng;
  }
}

export class Map {
  llmap!: L.Map;

  initMap(elem: any) {
    this.llmap = L.map(elem).setView(
      [35.69432984468491, 139.74267643565133],
      12,
    );

    L.tileLayer(
      'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets', // mapbox.streets | mapbox.satellite
        accessToken: 'your.mapbox.access.token',
      },
    ).addTo(this.llmap);
  }

  putMarker(latlng: { lat: number; lng: number }) {
    const marker1 = L.marker([latlng.lat, latlng.lng]).addTo(this.llmap);
  }
}
