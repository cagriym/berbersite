import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout';
import Admin from './Admin';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Admin paneli için yol. /admin altındaki tüm yolları yakalar. */}
      <Route path="/admin/*" element={<Admin />} />

      {/* Ana Tanıtım Sitesi */}
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}

export default App;