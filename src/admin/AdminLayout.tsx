import React from 'react';
import Sidebar from './Sidebar';
import Appointments from './Appointments';
import Needs from './Needs';
import Personnel from './Personnel';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Customers from './Customers';
import ContactMessages from './ContactMessages';

interface AdminLayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar onLogout={onLogout} />
            <main className="flex-1 p-8 overflow-y-auto">
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="needs" element={<Needs />} />
                    <Route path="personnel" element={<Personnel />} />
                    <Route path="contact-messages" element={<ContactMessages />} />
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminLayout; 