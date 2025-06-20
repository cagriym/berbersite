import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    return (
        <div className="w-64 h-full bg-white border-r shadow-sm flex flex-col">
            <div className="flex items-center justify-center h-20 border-b">
                <span className="text-xl font-bold text-amber-700">Berber Admin</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}> <i className="fas fa-tachometer-alt mr-3"></i> Gösterge Paneli </NavLink>
                <NavLink to="/admin/customers" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}> <i className="fas fa-users mr-3"></i> Müşteriler </NavLink>
                <NavLink to="/admin/appointments" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}> <i className="fas fa-calendar-check mr-3"></i> Randevular </NavLink>
                <NavLink to="/admin/needs" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}> <i className="fas fa-box-open mr-3"></i> İhtiyaç Yönetimi </NavLink>
                <NavLink to="/admin/personnel" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}> <i className="fas fa-user-cog mr-3"></i> Personel Yönetimi </NavLink>
            </nav>
            <div className="p-4 border-t">
                <button onClick={onLogout} className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Çıkış Yap</button>
            </div>
        </div>
    );
};

export default Sidebar; 