import React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';

import 'react-sortable-tree/style.css';
import 'semantic-ui-css/semantic.min.css'
// import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Layout>
      <Route exact path='/' component={Home} />
      <Route path='/counter' component={Counter} />
      <Route path='/fetch-data' component={FetchData} />
    </Layout>
  );
}

export default App;
