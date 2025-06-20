import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col min-h-screen">
      <div className="h-16 flex items-center justify-center font-bold text-xl text-blue-700 border-b">Admin Paneli</div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? 'block p-2 rounded bg-blue-100 text-blue-700 font-semibold' : 'block p-2 rounded hover:bg-blue-50'}>Mali Durum</NavLink>
        <NavLink to="/admin/appointments" className={({isActive}) => isActive ? 'block p-2 rounded bg-blue-100 text-blue-700 font-semibold' : 'block p-2 rounded hover:bg-blue-50'}>Randevular</NavLink>
        <NavLink to="/admin/customers" className={({isActive}) => isActive ? 'block p-2 rounded bg-blue-100 text-blue-700 font-semibold' : 'block p-2 rounded hover:bg-blue-50'}>Müşteriler</NavLink>
        <NavLink to="/admin/needs" className={({isActive}) => isActive ? 'block p-2 rounded bg-blue-100 text-blue-700 font-semibold' : 'block p-2 rounded hover:bg-blue-50'}>İhtiyaçlar</NavLink>
      </nav>
      <button onClick={handleLogout} className="m-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition">Çıkış Yap</button>
    </aside>
  );
};

export default Sidebar; 