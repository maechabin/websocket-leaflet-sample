import React from 'react';

import { Map, Marker } from './domains';

const App: React.FC = () => {
  const token = new Date().getTime();
  const map = new Map();
  // const sock = new WebSocket('ws://localhost:5001');
  const sock = new WebSocket(`${process.env.REACT_APP_WEB_SOCKET}`);
  const listener = new WebSocket(`${process.env.REACT_APP_WEB_SOCKET}`);

  function getColorCode() {
    // const color = ((Math.random() * 0xffffff) | 0).toString(16);
    // return `#${('000000' + color).slice(-6)}`;
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    return [`rgba(${r},${g},${b},1)`, `rgba(${r},${g},${b},0.4)`];
  }
  const color = getColorCode();

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
        color,
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
                color,
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
              color,
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
        case 'location':
          if (!map.location && sendedMarker.token === token) {
            map.panTo(sendedMarker.lat, sendedMarker.lng);
          }
          map.putLocationMarker(sendedMarker);
      }
    });
  });

  const style = {
    position: 'absolute',
    width: '100%',
    height: '100vh',
    zIndex: 0,
  } as React.CSSProperties;

  const button = {
    position: 'absolute',
    left: 'calc(50% - 65px)',
    top: '10px',
    zIndex: 1000,
    width: '128px',
    lineHeight: '32px',
    border: '1px solid #999',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  } as React.CSSProperties;

  function handleClick() {
    map.getLocation();
  }

  React.useEffect(() => {
    map.llmap.on('locationfound', (e: L.LeafletEvent) => {
      console.log(`現在地を取得しました: ${e.latlng.lat}, ${e.latlng.lng}`);

      const marker: Marker = {
        token,
        color,
        id: new Date().getTime(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        task: 'location',
      };
      // console.log(`lat: ${marker.lat}, lng: ${marker.lng}`);
      sock.send(JSON.stringify(marker));
    });
  });

  return (
    <>
      <div ref={mapRef} style={style}></div>
      <button onClick={() => handleClick()} style={button}>
        現在地を共有する
      </button>
    </>
  );
};

export default App;
