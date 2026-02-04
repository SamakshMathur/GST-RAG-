import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-sentinel-dark border-b border-sentinel-blue/20 h-16 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-brand-gradient flex items-center justify-center shadow-lg group-hover:shadow-sentinel-green/30 transition-shadow">
            <span className="text-white font-brand text-xs font-bold tracking-widest">S</span>
          </div>
          <span className="text-white font-brand text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
            Sentinel.AI
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/gst" 
            className={`text-sm font-medium transition-colors duration-200 ${isActive('/gst') ? 'text-sentinel-green' : 'text-gray-400 hover:text-white'}`}
          >
            GST
          </Link>
          <Link 
            to="/about" 
            className={`text-sm font-medium transition-colors duration-200 ${isActive('/about') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            About
          </Link>
          <Link 
            to="/docs" 
            className={`text-sm font-medium transition-colors duration-200 ${isActive('/docs') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Docs
          </Link>
          <Link 
            to="/login"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-sentinel-green hover:bg-[#096646] transition-all transform hover:-translate-y-0.5 font-sans"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
