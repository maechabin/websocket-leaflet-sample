import React from 'react';

import { Map, Marker } from './domains';
import { style } from './style';
import * as helper from './helper';

const App: React.FC = () => {
  // const sock = new WebSocket('ws://localhost:5001');
  const sock = new WebSocket(`${process.env.REACT_APP_WEB_SOCKET}`);
  const listener = new WebSocket(`${process.env.REACT_APP_WEB_SOCKET}`);

  const token = new Date().getTime();
  const color = helper.getColorCode();

  const [map] = React.useState(new Map());
  const [markers, setMarkers] = React.useState<{ [token: number]: Marker }>({});

  const mapRef = React.useRef(null);

  React.useEffect(() => {
    sock.addEventListener('open', e => {
      console.log('Socket 接続成功');
    });
  }, []);

  React.useEffect(() => {
    map.initMap(mapRef.current);
  }, []);

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
  }, []);

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
          if (
            !map.locations[sendedMarker.token] &&
            sendedMarker.token === token
          ) {
            map.panTo(sendedMarker.lat, sendedMarker.lng);
          }

          if (!map.locationList[sendedMarker.token]) {
            map.locationList = {
              ...map.locationList,
              [sendedMarker.token]: sendedMarker,
            };

            setMarkers(map.locationList);
          }

          map.putLocationMarker(sendedMarker);
      }
    });
  }, []);

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
  }, []);

  const mapStyle = style.map;
  const buttonStyle = style.button;
  const ulStyle = style.ul;

  const markerList = () => {
    if (Object.values(markers).length !== 0) {
      const list = Object.values(markers).map((marker: Marker) => {
        return <MarkerList map={map} marker={marker} key={marker.token} />;
      });

      return <ul style={ulStyle}>{list}</ul>;
    }
  };

  return (
    <>
      <div ref={mapRef} style={mapStyle}></div>
      <button onClick={() => handleClick()} style={buttonStyle}>
        現在地を共有する
      </button>
      {markerList()}
    </>
  );
};

function MarkerList(props: { map: Map; marker: Marker }) {
  const { map, marker } = props;
  const liStyle = {
    ...style.li,
    boxShadow: `0 0 0 8px ${marker.color[1]}`,
    backgroundColor: `${marker.color[0]}`,
  };

  return (
    <li onClick={() => map.panTo(marker.lat, marker.lng)} style={liStyle}></li>
  );
}

export default App;
