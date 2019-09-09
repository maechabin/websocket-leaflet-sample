export interface Markers {
  [token: number]: Marker;
}

export interface Marker {
  token: number;
  color: string[];
  id: number;
  lat: number;
  lng: number;
  task: string;
}
