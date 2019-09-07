import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Container from './Container';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Route exact path="/" component={Container} />
      <Route path="/:channel" component={Container} />
    </BrowserRouter>
  );
};

export default App;
