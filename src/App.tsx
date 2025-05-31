import React from 'react';
import Header from './components/Header';
import DynamicDashboard from './components/DynamicDashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <DynamicDashboard />
    </div>
  );
}

export default App;