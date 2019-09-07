import React from 'react';

import { Map, Marker } from '../domains/map';
import * as style from '../core/style';

type Props = {
  map: Map;
  markers: { [token: number]: Marker };
};

function MarkerList(props: Props) {
  const { map, markers } = props;

  if (Object.values(markers).length !== 0) {
    const list = Object.values(markers).map((marker: Marker) => {
      const liStyle = {
        ...style.li,
        boxShadow: `0 0 0 8px ${marker.color[1]}`,
        backgroundColor: `${marker.color[0]}`,
      };

      return (
        <li
          onClick={() => map.panTo(marker.lat, marker.lng)}
          style={liStyle}
          key={marker.token}
        ></li>
      );
    });

    return <ul style={style.ul}>{list}</ul>;
  }
  return null;
}

export default MarkerList;
