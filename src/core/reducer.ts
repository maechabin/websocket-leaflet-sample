import { Markers } from '../domains/map';

export interface State {
  markers: Markers;
  isSharing: boolean;
  isDisabled: boolean;
}

export const initialState: State = {
  markers: {},
  isSharing: false,
  isDisabled: true,
};

export enum actionType {
  UPDATE_MARKERS,
  UPDATE_IS_SHARING,
  UPDATE_IS_DISABLED,
}

export function updateMarkers(payload: Markers) {
  return {
    type: actionType.UPDATE_MARKERS,
    payload,
  };
}

export function updateIsDisabled(payload: boolean) {
  return {
    type: actionType.UPDATE_IS_DISABLED,
    payload,
  };
}

export function updateIsSharing(payload: boolean) {
  return {
    type: actionType.UPDATE_IS_SHARING,
    payload,
  };
}

export function reducer(state: State, action: any): State {
  switch (action.type) {
    case actionType.UPDATE_MARKERS:
      return {
        ...state,
        markers: action.payload,
      };
    case actionType.UPDATE_IS_SHARING:
      return {
        ...state,
        isSharing: action.payload,
      };
    case actionType.UPDATE_IS_DISABLED:
      return {
        ...state,
        isDisabled: action.payload,
      };
    default:
      return state;
  }
}
