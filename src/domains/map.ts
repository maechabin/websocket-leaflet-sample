import L from 'leaflet';

import { Marker } from './map.model';

declare module 'leaflet' {
  interface LeafletEvent {
    latlng: LatLng;
  }
}

export class Map {
  llmap!: L.Map;
  markers: {
    [id: number]: L.Marker;
  } = {};

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

  putMarker(marker: Marker) {
    this.markers[marker.id] = L.marker([marker.lat, marker.lng], {
      draggable: true,
    }).addTo(this.llmap);

    return { id: marker.id, marker: this.markers[marker.id] };
  }

  moveMarker(marker: Marker) {
    this.markers[marker.id].setLatLng([marker.lat, marker.lng]);
  }

  removeMarker(marker: Marker) {
    this.llmap.removeLayer(this.markers[marker.id]);
  }

  getCurrentPosition() {
    this.llmap.locate({
      watch: true,
      enableHighAccuracy: true,
    });
    this.llmap.on('locationfound', (data: L.LeafletEvent) => {
      console.log(
        `現在地を取得しました: ${data.latlng.lat}, ${data.latlng.lng}`,
      );
    });
  }
}
