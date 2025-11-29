import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-900 shadow-md sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden">
            <img 
                src="https://psub.psu.ac.th/wp-content/uploads/2024/11/PSU-Broadcast-Vertical-1x1-1.png" 
                alt="PSU Logo" 
                className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">หาบ้าน</h1>
            <p className="text-xs text-blue-200">PSU Broadcast</p>
          </div>
        </Link>
        <div className="flex gap-2">
            <Link to="/admin" className="p-2 text-blue-200 hover:text-white transition-colors">
                <Settings size={20} />
            </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;