import * as L from 'leaflet';

import { Marker } from './map.model';
import 'leaflet.gridlayer.googlemutant';

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
  locations: { [token: number]: L.Marker } = {};
  locationList: { [token: number]: Marker } = {};

  initMap(elem: any) {
    const token =
      'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    /** Layer */
    const streetsLayer = L.tileLayer(
      `
    https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${token}
    `,
      {
        attribution: `
          Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,
          <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,
          Imagery © <a href="https://www.mapbox.com/">Mapbox</a>
        `,
        maxZoom: 18,
        id: 'mapbox.streets', // mapbox.streets | mapbox.satellite
        accessToken: 'your.mapbox.access.token',
      },
    );

    const satelliteLayer = L.tileLayer(
      `
    https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${token}
    `,
      {
        attribution: `
          Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,
          <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,
          Imagery © <a href="https://www.mapbox.com/">Mapbox</a>
        `,
        maxZoom: 18,
        id: 'mapbox.satellite', // mapbox.streets | mapbox.satellite
        accessToken: 'your.mapbox.access.token',
      },
    );

    const googlemaps = L.gridLayer.googleMutant({
      type: 'roadmap', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });

    this.llmap = L.map(elem)
      .setView([35.69432984468491, 139.74267643565133], 12)
      .addLayer(streetsLayer);

    L.control
      .layers({
        street: streetsLayer,
        satellite: satelliteLayer,
        'google maps': googlemaps,
      })
      .addTo(this.llmap);
  }

  putMarker(marker: Marker): { id: number; marker: L.Marker } {
    /** Icon */
    const markerHtmlStyles1 = `
      position: absolute;
      left: -12px;
      top: -12px;
      border-radius: 50%;
      border: 8px solid ${marker.color[0]};
      width: 8px;
      height: 8px;
    `;
    const markerHtmlStyles2 = `
      position: absolute;
      bottom: -30px;
      left: -6px;
      border: 10px solid transparent;
      border-top: 17px solid ${marker.color[0]};
    `;
    const icon = L.divIcon({
      className: 'marker-icon',
      iconAnchor: [0, 24],
      popupAnchor: [0, -36],
      html: `
        <span style="${markerHtmlStyles1}" />
        <span style="${markerHtmlStyles2}" />
      `,
    });

    this.markers[marker.id] = L.marker([marker.lat, marker.lng], {
      icon,
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

  getLocation() {
    if (this.llmap && this.llmap.locate) {
      this.llmap.locate({
        watch: true,
        enableHighAccuracy: true,
      });
    }
  }

  stopGetLocation() {
    this.llmap.stopLocate();
    this.llmap.fire('locationstop');
  }

  removeLacateMarker(token: number) {
    this.llmap.removeLayer(this.locations[token]);
  }

  putLocationMarker(marker: Marker) {
    const markerHtmlStyles = `
      position: absolute;
      width: 10px;
      height: 10px;
      top: 7px;
      left: 7px;
      box-shadow: 0 0 0 8px ${marker.color[1]};
      border-radius: 50%;
      border: 2px solid #fff;
      background-color: ${marker.color[0]};
    `;
    const icon = L.divIcon({
      className: 'marker-icon',
      iconAnchor: [0, 24],
      popupAnchor: [0, -36],
      html: `
        <span style="${markerHtmlStyles}" />
      `,
    });

    if (this.locations[marker.token]) {
      this.llmap.removeLayer(this.locations[marker.token]);
    }
    this.locations[marker.token] = L.marker([marker.lat, marker.lng], {
      icon,
      draggable: false,
    })
      .addTo(this.llmap)
      .on('click', () => {
        this.panTo(marker.lat, marker.lng);
      });
  }

  panTo(lat: number, lng: number) {
    this.llmap.panTo(new L.LatLng(lat, lng));
  }
}
