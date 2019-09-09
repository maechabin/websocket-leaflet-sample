import React from 'react';

import { Map, Marker } from './domains/map';
import {
  reducer,
  initialState,
  updateIsDisabled,
  updateIsSharing,
} from './core/reducer';
import LLMap from './components/LLMap';
import MarkerList from './components/MarkerList';
import LocateButton from './components/LocateButton';

const Container: React.FC = () => {
  const [map] = React.useState(new Map());

  const [state, dispatch] = React.useReducer(reducer, initialState);

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
      <LLMap map={map} dispatch={dispatch} />
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
