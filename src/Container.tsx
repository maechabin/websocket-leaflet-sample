import React from 'react';

import { Map, Marker } from './domains/map';
import {
  reducer,
  initialState,
  updateIsDisabled,
  updateIsSharing,
  updateMarkers,
} from './core/reducer';
import * as helper from './core/helper';
import LLMap from './components/LLMap';
import MarkerList from './components/MarkerList';
import LocateButton from './components/LocateButton';

const Container: React.FC = () => {
  const [map] = React.useState(new Map());
  const [state, dispatch] = React.useReducer(reducer, initialState);

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

  function controlLocate() {
    dispatch(updateIsDisabled(true));
    if (state.isSharing) {
      map.stopGetLocation();
    } else {
      map.getLocation();
    }
    dispatch(updateIsSharing(!state.isSharing));
  }

  function panTo(lat: number, lng: number) {
    map.panTo(lat, lng);
  }

  return (
    <>
      <LLMap
        map={map}
        dispatch={dispatch}
        token={token}
        color={color}
        sendDatatoWS={sendDatatoWS}
      />
      <LocateButton
        isDisabled={state.isDisabled}
        isSharing={state.isSharing}
        controlLocate={controlLocate}
      />
      <MarkerList markers={state.markers} panTo={panTo} />
    </>
  );
};

export default Container;
