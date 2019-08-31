import React from 'react';

import { Map } from './domains/map';

const App: React.FC = () => {
  const map = new Map();
  const sock = new WebSocket('ws://localhost:5001');
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    sock.addEventListener('open', e => {
      console.log('Socket 接続成功');
    });
  });

  React.useEffect(() => {
    map.initMap(mapRef.current);
  });

  React.useEffect(() => {
    map.llmap.on('click', (e: L.LeafletEvent) => {
      const latlng = {
        id: new Date().getTime(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      console.log(`lat: ${latlng.lat}, lng: ${latlng.lng}`);
      sock.send(JSON.stringify(latlng));
    });
  });

  React.useEffect(() => {
    const id = new Date().getTime();
    sock.addEventListener('message', (e: MessageEvent) => {
      const latlng = JSON.parse(e.data);

      if (id > latlng.id) return;

      if (map.markers[latlng.id]) {
        map.moveMarker(latlng);
      } else {
        const m = map.putMarker(latlng);

        m.marker.on('drag', (e: L.LeafletEvent) => {
          const latlng = {
            id: m.id,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          };
          console.log(`lat: ${latlng.lat}, lng: ${latlng.lng}`);
          sock.send(JSON.stringify(latlng));
        });
      }
    });
  });

  const style = {
    width: '100%',
    height: '100vh',
  } as React.CSSProperties;

  return <div ref={mapRef} style={style}></div>;
};

export default App;
