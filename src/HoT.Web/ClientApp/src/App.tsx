import React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Locations } from './components/Locations';
import { Things } from './components/Things';

import 'semantic-ui-css/semantic.min.css';
// import logo from './logo.svg';
import './App.css';

import './css/fonts/flaticon/flaticon.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Layout>
        <Route exact path='/' component={Locations} />
        <Route path='/things' component={Things} />
      </Layout>
    </DndProvider>
  );
}

export default App;
