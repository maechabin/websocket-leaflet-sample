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
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      console.log(`lat: ${latlng.lat}, lng: ${latlng.lng}`);
      sock.send(JSON.stringify(latlng));
    });
  });

  React.useEffect(() => {
    sock.addEventListener('message', (e: MessageEvent) => {
      map.putMarker(JSON.parse(e.data));
    });
  });

  const style = {
    width: '100%',
    height: '100vh',
  } as React.CSSProperties;

  return <div ref={mapRef} style={style}></div>;
};

export default App;
