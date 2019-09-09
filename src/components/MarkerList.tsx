import React from 'react';

import { Marker, Markers } from '../domains/map';
import * as style from '../core/style';

type Props = {
  markers: Markers;
  panTo: (lat: number, lng: number) => void;
};

function MarkerList(props: Props) {
  const { markers, panTo } = props;

  if (Object.values(markers).length !== 0) {
    const list = Object.values(markers).map((marker: Marker) => {
      const liStyle = {
        ...style.li,
        boxShadow: `0 0 0 8px ${marker.color[1]}`,
        backgroundColor: `${marker.color[0]}`,
      };

      function handleClick() {
        panTo(marker.lat, marker.lng);
      }

      return <li onClick={handleClick} style={liStyle} key={marker.token}></li>;
    });

    return <ul style={style.ul}>{list}</ul>;
  }
  return null;
}

export default MarkerList;
