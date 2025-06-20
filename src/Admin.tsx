import React, { useState } from 'react';
import AdminLayout from './admin/AdminLayout';

const Admin: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        return sessionStorage.getItem('isLoggedIn') === 'true';
    });
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username === 'admin' && password === 'admin123') {
            sessionStorage.setItem('isLoggedIn', 'true');
            setIsLoggedIn(true);
            window.location.reload(); 
        } else {
            setError('Kullanıcı adı veya şifre yanlış.');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-box">
                    <h2>Admin Girişi</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username">Kullanıcı Adı</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Şifre</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Giriş Yap</button>
                    </form>
                </div>
            </div>
        );
    }

    return <AdminLayout />;
};

export default Admin; 