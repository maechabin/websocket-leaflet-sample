import React from 'react';

import { Map, Marker } from '../domains/map';
import { updateIsDisabled, updateMarkers } from '../core/reducer';
import * as style from '../core/style';
import * as helper from '../core/helper';

type Props = {
  map: Map;
  dispatch: React.Dispatch<any>;
};

function LLMap(props: Props) {
  const { map, dispatch } = props;
  // const sock = new WebSocket('ws://localhost:5001');
  const mapRef = React.useRef(null);

  const channel = helper.getPath();
  const room = helper.getParam('room');
  let sock: WebSocket;
  let listener: WebSocket;

  const [color] = React.useState(helper.getColorCode());
  const [token] = React.useState(new Date().getTime());

  function connectToWebSocket() {
    sock = new WebSocket(
      `${process.env.REACT_APP_WEB_SOCKET}/${channel}?room_id=${room}`,
    );
    sock.addEventListener('open', event => {
      console.log('Socket 接続成功');
      dispatch(updateIsDisabled(false));
    });
    listener = new WebSocket(
      `${process.env.REACT_APP_WEB_SOCKET}/${channel}?room_id=${room}`,
    );
    listener.addEventListener('open', event => {
      console.log('Listener 接続成功');
      dispatch(updateIsDisabled(false));
    });

    listener.addEventListener('message', (event: MessageEvent) => {
      const sendedMarker = JSON.parse(event.data);
      if (token > sendedMarker.id) return;

      switch (sendedMarker.task) {
        case 'put':
          const m = map.putMarker(sendedMarker);
          let timer: any;

          m.marker.on('drag', (event: L.LeafletEvent) => {
            clearTimeout(timer);
            timer = setTimeout(function() {
              const marker: Marker = {
                token,
                color,
                id: m.id,
                lat: event.latlng.lat,
                lng: event.latlng.lng,
                task: 'move',
              };
              // console.log(`lat: ${marker.lat}, lng: ${marker.lng}`);
              sendDatatoWS(JSON.stringify(marker));
            }, 16);
          });

          m.marker.on('click', (event: L.LeafletEvent) => {
            const marker: Marker = {
              token,
              color,
              id: m.id,
              lat: event.latlng.lat,
              lng: event.latlng.lng,
              task: 'remove',
            };
            sendDatatoWS(JSON.stringify(marker));
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
          }
          dispatch(updateMarkers(map.locationList));
          map.putLocationMarker(sendedMarker);
          dispatch(updateIsDisabled(false));
          break;
        case 'removeLocation':
          delete map.locationList[sendedMarker.token];
          dispatch(updateMarkers(map.locationList));
          map.removeLacateMarker(sendedMarker.token);
          dispatch(updateIsDisabled(false));
          break;
      }
    });
  }

  function sendDatatoWS(data: string) {
    if (sock.readyState === WebSocket.OPEN) {
      sock.send(data);
    } else {
      sock.close();
      listener.close();
      console.error('接続切断中');
      connectToWebSocket();
    }
  }

  React.useEffect(() => {
    connectToWebSocket();
  }, []);

  React.useEffect(() => {
    map.initMap(mapRef.current);

    map.llmap.on('click', (event: L.LeafletEvent) => {
      const marker: Marker = {
        token,
        color,
        id: new Date().getTime(),
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        task: 'put',
      };
      // console.log(`lat: ${marker.lat}, lng: ${marker.lng}`);
      sendDatatoWS(JSON.stringify(marker));
    });

    map.llmap.on('locationfound', (event: L.LeafletEvent) => {
      dispatch(updateIsDisabled(true));
      console.log(
        `現在地を取得しました: ${event.latlng.lat}, ${event.latlng.lng}`,
      );

      const marker: Marker = {
        token,
        color,
        id: new Date().getTime(),
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        task: 'location',
      };
      sendDatatoWS(JSON.stringify(marker));
    });

    map.llmap.on('locationstop', () => {
      const marker: Marker = {
        token,
        color,
        id: new Date().getTime(),
        lat: NaN,
        lng: NaN,
        task: 'removeLocation',
      };
      sendDatatoWS(JSON.stringify(marker));
    });

    map.llmap.on('locationerror', error => {
      console.error(error);
    });
  }, []);

  return <div ref={mapRef} style={style.map}></div>;
}

export default LLMap;
