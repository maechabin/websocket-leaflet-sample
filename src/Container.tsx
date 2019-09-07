import React from 'react';

import { Map, Marker } from './domains/map';

import LLMap from './components/LLMap';
import MarkerList from './components/MarkerList';
import LocateButton from './components/LocateButton';

interface State {
  markers: { [token: number]: Marker };
  isSharing: boolean;
  isDisabled: boolean;
}

const Container: React.FC = () => {
  const [map] = React.useState(new Map());

  const initialState = {
    markers: {},
    isSharing: false,
    isDisabled: true,
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

  function controlLocate() {
    dispatch({ type: 'updateIsDisabled', payload: true });
    if (state.isSharing) {
      map.stopGetLocation();
      dispatch({ type: 'updateIsSharing', payload: !state.isSharing });
    } else {
      map.getLocation();
      dispatch({ type: 'updateIsSharing', payload: !state.isSharing });
    }
  }

  return (
    <>
      <LLMap map={map} dispatch={dispatch} />
      <LocateButton
        isDisabled={state.isDisabled}
        isSharing={state.isSharing}
        controlLocate={controlLocate}
      />
      <MarkerList map={map} markers={state.markers} />
    </>
  );
};

export default Container;
