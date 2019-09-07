import React from 'react';

import { Map, Marker } from './domains';
import { style } from './style';
import * as helper from './helper';

interface State {
  markers: { [token: number]: Marker };
  isSharing: boolean;
  isDisabled: boolean;
}

const App: React.FC = () => {
  // const sock = new WebSocket('ws://localhost:5001');
  const room = helper.getParam('room');
  let sock: WebSocket;
  let listener: WebSocket;

  const [color] = React.useState(helper.getColorCode());
  const [token] = React.useState(new Date().getTime());
  const [map] = React.useState(new Map());
  const initialState = {
    markers: {},
    isSharing: false,
    isDisabled: false,
  };

  function reducer(state: State, action: any): State {
    switch (action.type) {
      case 'updateMarkers':
        return {
          ...state,
          markers: action.payload,
        };
      case 'updateIsSharing':
        return {
          ...state,
          isSharing: action.payload,
        };
      case 'updateIsDisabled':
        return {
          ...state,
          isDisabled: action.payload,
        };
      default:
        return state;
    }
  }
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const mapRef = React.useRef(null);

  React.useEffect(() => {
    sock = new WebSocket(`${process.env.REACT_APP_WEB_SOCKET}?room_id=${room}`);
    sock.addEventListener('open', e => {
      console.log('Socket 接続成功');
    });
    sock.addEventListener('error', e => {
      console.error(e);
    });

    listener = new WebSocket(
      `${process.env.REACT_APP_WEB_SOCKET}?room_id=${room}`,
    );
    listener.addEventListener('error', e => {
      console.error(e);
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
          }
          dispatch({ type: 'updateMarkers', payload: map.locationList });
          map.putLocationMarker(sendedMarker);
          dispatch({ type: 'updateIsDisabled', payload: false });
          break;
        case 'removeLocation':
          delete map.locationList[sendedMarker.token];
          dispatch({ type: 'updateMarkers', payload: map.locationList });
          map.removeLacateMarker(sendedMarker.token);
          dispatch({ type: 'updateIsDisabled', payload: false });
          break;
      }
    });
  }, []);

  React.useEffect(() => {
    map.llmap.on('locationfound', (e: L.LeafletEvent) => {
      dispatch({ type: 'updateIsDisabled', payload: true });
      console.log(`現在地を取得しました: ${e.latlng.lat}, ${e.latlng.lng}`);

      const marker: Marker = {
        token,
        color,
        id: new Date().getTime(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        task: 'location',
      };
      sock.send(JSON.stringify(marker));
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
      sock.send(JSON.stringify(marker));
    });

    map.llmap.on('locationerror', error => {
      console.error(error);
    });
  }, []);

  const mapStyle = style.map;
  const buttonStyle = style.button;
  const ulStyle = style.ul;

  function handleClick() {
    dispatch({ type: 'updateIsDisabled', payload: true });
    if (state.isSharing) {
      map.stopGetLocation();
      dispatch({ type: 'updateIsSharing', payload: !state.isSharing });
    } else {
      map.getLocation();
      dispatch({ type: 'updateIsSharing', payload: !state.isSharing });
    }
  }

  const locateButton = () => {
    const button = state.isSharing ? (
      <button
        onClick={() => handleClick()}
        style={buttonStyle}
        disabled={state.isDisabled}
      >
        現在地の共有を停止する
      </button>
    ) : (
      <button
        onClick={() => handleClick()}
        style={buttonStyle}
        disabled={state.isDisabled}
      >
        現在地の共有を開始する
      </button>
    );

    return button;
  };

  const markerList = () => {
    if (Object.values(state.markers).length !== 0) {
      const list = Object.values(state.markers).map((marker: Marker) => {
        return <MarkerList map={map} marker={marker} key={marker.token} />;
      });

      return <ul style={ulStyle}>{list}</ul>;
    }
  };

  return (
    <>
      <div ref={mapRef} style={mapStyle}></div>
      {locateButton()}
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
