import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Transport from './pages/Transport';
import Jobs from './pages/Jobs';
import Housing from './pages/Housing';
import MapPage from './pages/Map';
import Admin from './pages/Admin';
import News from './pages/News';
import Report from './pages/Report';
import Directory from './pages/Directory';
import Alerts from './pages/Alerts';
import Boleia from './pages/Boleia';
import PerdidosAchados from './pages/PerdidosAchados';
import Navbar from './components/Navbar';
import CookieBanner from './components/CookieBanner';
import Events from './pages/Events';
import AuthContext from './AuthContext';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <AuthContext>
      <div className="app-container">
        <div className="content-wrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/housing" element={<Housing />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/news" element={<News />} />
            <Route path="/report" element={<Report />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/boleia" element={<Boleia />} />
            <Route path="/perdidos" element={<PerdidosAchados />} />
            <Route path="/events" element={<Events />} />
          </Routes>
        </div>
        <AIAssistant />
        <CookieBanner />
        <Navbar />
      </div>
    </AuthContext>
  );
}

export default App
