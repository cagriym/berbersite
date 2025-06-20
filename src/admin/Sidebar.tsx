import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const navigate = useNavigate();

    return (
        <div className="w-64 bg-white shadow-md flex flex-col">
            <div className="p-6 text-center">
                <img src="/logo192.png" alt="Logo" className="w-20 h-20 mx-auto rounded-full mb-3" />
                <h1 className="text-xl font-semibold text-gray-700">Admin Paneli</h1>
            </div>
            <nav className="flex-1 px-4 py-2">
                <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}>
                    <i className="fas fa-tachometer-alt mr-3"></i> Gösterge Paneli
                </NavLink>
                <NavLink to="/admin/appointments" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}>
                    <i className="fas fa-calendar-check mr-3"></i> Randevular
                </NavLink>
                <NavLink to="/admin/customers" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}>
                    <i className="fas fa-users mr-3"></i> Müşteriler
                </NavLink>
                <NavLink to="/admin/needs" className={({ isActive }) => `flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-amber-100 hover:text-amber-700 ${isActive ? 'bg-amber-200 text-amber-800' : ''}`}>
                    <i className="fas fa-box-open mr-3"></i> İhtiyaçlar
                </NavLink>
            </nav>
            <div className="p-4 border-t">
                <button
                    onClick={() => {
                        if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
                            onLogout();
                        }
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-red-600 rounded-md hover:bg-red-100 hover:text-red-800"
                >
                    <i className="fas fa-sign-out-alt mr-3"></i> Çıkış Yap
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 