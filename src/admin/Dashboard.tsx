import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface StatCardProps {
    title: string;
    value: number | string;
    icon: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className={`p-6 bg-white rounded-lg shadow-lg flex items-center space-x-6 border-l-4 ${color}`}>
        <div className={`text-4xl ${color.replace('border', 'text').replace('-l-4', '-600')}`}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <p className="text-lg font-semibold text-gray-700">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        totalCustomers: 0,
        totalNeeds: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [appointmentsRes, customersRes, needsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/Appointments`),
                fetch(`${API_BASE_URL}/api/Musteriler`),
                fetch(`${API_BASE_URL}/api/Needs`),
            ]);

            if (!appointmentsRes.ok || !customersRes.ok || !needsRes.ok) {
                throw new Error('Veri özetleri çekilemedi.');
            }

            const appointments = await appointmentsRes.json();
            const customers = await customersRes.json();
            const needs = await needsRes.json();

            setStats({
                totalAppointments: appointments.length,
                pendingAppointments: appointments.filter((a: any) => !a.tamamlandimi).length,
                totalCustomers: customers.length,
                totalNeeds: needs.length,
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div></div>;
    if (error) return <div className="p-4 text-red-700 bg-red-100 rounded-lg">Hata: {error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gösterge Paneli</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Toplam Randevu" value={stats.totalAppointments} icon="fa-calendar-alt" color="border-blue-500" />
                <StatCard title="Bekleyen Randevu" value={stats.pendingAppointments} icon="fa-hourglass-half" color="border-yellow-500" />
                <StatCard title="Toplam Müşteri" value={stats.totalCustomers} icon="fa-users" color="border-green-500" />
                <StatCard title="Toplam İhtiyaç" value={stats.totalNeeds} icon="fa-box-open" color="border-purple-500" />
            </div>
            {/* Buraya daha sonra grafikler veya son aktiviteler gibi başka bileşenler eklenebilir */}
        </div>
    );
};

export default Dashboard; 