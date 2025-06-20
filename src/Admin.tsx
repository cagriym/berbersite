import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Appointments from './admin/Appointments';
import Customers from './admin/Customers';
import Needs from './admin/Needs';

// Bu bileşen artık Admin.tsx içinde yer alıyor
const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username === 'admin' && password === 'admin123') {
            sessionStorage.setItem('isLoggedIn', 'true');
            onLogin(); // Üst bileşeni haberdar et
        } else {
            setError('Kullanıcı adı veya şifre yanlış.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <img src="/logo192.png" alt="Logo" className="w-24 h-24 mx-auto rounded-full mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800">Admin Paneli Girişi</h2>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="text-sm font-bold text-gray-600 block">Kullanıcı Adı</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 mt-2 text-gray-700 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-bold text-gray-600 block">Şifre</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 mt-2 text-gray-700 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full px-4 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-300"
                    >
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
};


const Admin: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        // Tarayıcıda oturum durumunu kontrol et
        return sessionStorage.getItem('isLoggedIn') === 'true';
    });

    const handleLogin = () => {
        setIsLoggedIn(true);
        // Giriş sonrası yönlendirmeye gerek yok.
        // State değişikliği bileşeni yeniden render edecek ve AdminLayout gösterilecek.
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
        // Çıkış yapıldığında herhangi bir yönlendirmeye gerek yok,
        // bileşen yeniden render olacak ve Login ekranı gösterilecek.
    };

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <AdminLayout onLogout={handleLogout}>
            <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="customers" element={<Customers />} />
                <Route path="needs" element={<Needs />} />
            </Routes>
        </AdminLayout>
    );
};

export default Admin; 