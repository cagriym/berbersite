import React from 'react';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar onLogout={onLogout} />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout; 