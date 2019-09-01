import React from 'react';

import { Map } from './domains/map';
import { Marker } from './domains/map.model';

const App: React.FC = () => {
  const map = new Map();
  // const sock = new WebSocket('ws://localhost:5001');
  const sock = new WebSocket('wss://connect.websocket.in/maechabin?room_id=1');
  const listener = new WebSocket(
    'wss://connect.websocket.in/maechabin?room_id=1',
  );

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
      const marker: Marker = {
        id: new Date().getTime(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      console.log(`lat: ${marker.lat}, lng: ${marker.lng}`);
      sock.send(JSON.stringify(marker));
    });
  });

  React.useEffect(() => {
    const id = new Date().getTime();
    listener.addEventListener('message', (e: MessageEvent) => {
      const sendedMarker = JSON.parse(e.data);
      if (id > sendedMarker.id) return;

      if (sendedMarker.task === 'remove') {
        map.removeMarker(sendedMarker);
      }

      if (map.markers[sendedMarker.id]) {
        map.moveMarker(sendedMarker);
      } else {
        const m = map.putMarker(sendedMarker);

        m.marker.on('drag', (e: L.LeafletEvent) => {
          const marker: Marker = {
            id: m.id,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          };
          console.log(`lat: ${marker.lat}, lng: ${marker.lng}`);
          sock.send(JSON.stringify(marker));
        });
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
