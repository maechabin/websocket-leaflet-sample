import React from 'react';

import { Map, Marker } from '../domains/map';
import { updateIsDisabled } from '../core/reducer';
import * as style from '../core/style';

type Props = {
  map: Map;
  dispatch: React.Dispatch<any>;
  token: number;
  color: string[];
  sendDatatoWS: (marker: string) => void;
};

function LLMap(props: Props) {
  const { map, dispatch, token, color, sendDatatoWS } = props;
  // const sock = new WebSocket('ws://localhost:5001');
  const mapRef = React.useRef(null);

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
