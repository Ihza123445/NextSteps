// src/components/Navbar.jsx
import React from 'react';
import { Home, Bell, User, LogOut } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-[#0f172a] text-white px-6 py-4 flex justify-between items-center shadow-md rounded-b-lg">
      <div className="text-2xl font-bold">NextStep</div>
      <div className="flex items-center gap-6 text-xl">
        <button title="Home" className="hover:text-gray-300">
          <Home size={24} />
        </button>
        <button title="Notifikasi" className="hover:text-gray-300">
          <Bell size={24} />
        </button>
        <button title="Profil" className="hover:text-gray-300">
          <User size={24} />
        </button>
        <button title="Keluar" className="hover:text-gray-300">
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
