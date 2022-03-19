import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import About from './routes/About';
import Home from './routes/Home';
import Login from './routes/Login';

function App() {
  return (
    <div style={{ display: 'flex' }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
