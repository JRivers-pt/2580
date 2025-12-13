import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Transport from './pages/Transport';
import Jobs from './pages/Jobs';
import Housing from './pages/Housing';
import MapPage from './pages/Map'; // New
import Admin from './pages/Admin'; // New
import Navbar from './components/Navbar';
import AuthContext from './AuthContext';

function App() {
  const location = useLocation();
  // Hide navbar on some routes if needed, but keeping it simple for now

  return (
    <AuthContext>
      <div className="app-container">
        <div className="content-wrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/housing" element={<Housing />} />
            <Route path="/map" element={<MapPage />} /> {/* New */}
            <Route path="/admin" element={<Admin />} /> {/* Hidden Route */}
          </Routes>
        </div>
        <Navbar />
      </div>
    </AuthContext>
  );
}

export default App
