import React from 'react';

import { Map } from './domains/map';
import { Marker } from './domains/map.model';

const App: React.FC = () => {
  const token = new Date().getTime();
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
        token,
        id: new Date().getTime(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        task: 'put',
      };
      // console.log(`lat: ${marker.lat}, lng: ${marker.lng}`);
      sock.send(JSON.stringify(marker));
    });
  });

  React.useEffect(() => {
    listener.addEventListener('message', (e: MessageEvent) => {
      const sendedMarker = JSON.parse(e.data);
      if (token > sendedMarker.id) return;

      switch (sendedMarker.task) {
        case 'put':
          const m = map.putMarker(sendedMarker);
          let timer: any;

          m.marker.on('drag', (e: L.LeafletEvent) => {
            clearTimeout(timer);
            timer = setTimeout(function() {
              const marker: Marker = {
                token,
                id: m.id,
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                task: 'move',
              };
              // console.log(`lat: ${marker.lat}, lng: ${marker.lng}`);
              sock.send(JSON.stringify(marker));
            }, 16);
          });

          m.marker.on('click', (e: L.LeafletEvent) => {
            const marker: Marker = {
              token,
              id: m.id,
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              task: 'remove',
            };
            sock.send(JSON.stringify(marker));
          });
          break;
        case 'move':
          if (sendedMarker.token !== token) {
            map.moveMarker(sendedMarker);
          }
          break;
        case 'remove':
          map.removeMarker(sendedMarker);
          break;
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
