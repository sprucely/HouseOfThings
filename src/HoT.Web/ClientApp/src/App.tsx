import React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Locations } from './components/Locations';
import { Things } from './components/Things';

import 'semantic-ui-css/semantic.min.css'
// import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Layout>
      <Route exact path='/' component={Locations} />
      <Route path='/things' component={Things} />
    </Layout>
  );
}

export default App;
