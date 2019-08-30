import React from 'react';

import { Map } from './domains/map';
import './App.css';

const App: React.FC = () => {
  const map = new Map();
  const mapRef = React.useRef(null);
  React.useEffect(() => {
    map.initMap(mapRef.current);
  });

  const style = {
    width: '100%',
    height: '100vh',
  } as React.CSSProperties;

  return <div ref={mapRef} style={style}></div>;
};

export default App;
