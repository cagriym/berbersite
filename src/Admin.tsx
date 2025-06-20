import React, { useState } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Appointments from './admin/Appointments';
import Customers from './admin/Customers';
import Needs from './admin/Needs';

const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net/api';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // NOT: API'nizin gerçek login endpoint'i ile bu URL'yi değiştirin!
            const response = await fetch(`${API_BASE_URL}/Users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // Giriş başarılı olursa token'ı saklayın (localStorage veya sessionStorage)
                localStorage.setItem('admin_token', data.token);
                // Admin paneline yönlendirin
                navigate('/admin/dashboard'); // veya /admin/randevular
            } else {
                const errorData = await response.text();
                setError(errorData || 'Giriş başarısız. Kullanıcı adı veya şifre yanlış.');
            }
        } catch (err) {
            setError('Giriş sırasında bir hata oluştu. Lütfen ağ bağlantınızı kontrol edin.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Girişi</h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Kullanıcı Adı
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Admin = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('admin_token');

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    // If not logged in, redirect all /admin/* except /admin/login to login
    if (!isLoggedIn && location.pathname !== '/admin/login') {
        return <Navigate to="/admin/login" replace />;
    }
    // If logged in and on /admin/login, redirect to dashboard
    if (isLoggedIn && location.pathname === '/admin/login') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <Routes>
            <Route path="login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="customers" element={<Customers />} />
                <Route path="needs" element={<Needs />} />
                {/* Add more admin routes here */}
            </Route>
            {/* Default: redirect /admin to dashboard if logged in */}
            <Route path="*" element={<Navigate to={isLoggedIn ? "/admin/dashboard" : "/admin/login"} replace />} />
        </Routes>
    );
};

export default Admin; 