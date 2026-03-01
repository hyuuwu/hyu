import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Unreleased from './pages/Unreleased';
import Blog from './pages/Blog';
import Admin from './pages/Admin';
import './index.css';

function App() {
  return (
    <Router>
      <div className="ambient-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <nav className="navbar">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
        <NavLink to="/unreleased" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Unreleased</NavLink>
        <NavLink to="/blog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Blog</NavLink>
      </nav>
      <main className="container fade-in" style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unreleased" element={<Unreleased />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
