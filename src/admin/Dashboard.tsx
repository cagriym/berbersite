import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://oktay-sac-tasarim1.azurewebsites.net';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
    <div className={`p-6 bg-white rounded-lg shadow-lg flex items-center space-x-6 border-l-4 ${color}`}>
        <div className={`text-4xl ${color.replace('border', 'text').replace('-l-4', '-600')}`}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <p className="text-lg font-semibold text-gray-700">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        totalCustomers: 0,
        totalNeeds: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        averageAppointmentValue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [appointmentsRes, customersRes, needsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/Appointments`),
                fetch(`${API_BASE_URL}/api/Musteriler`),
                fetch(`${API_BASE_URL}/api/Needs`),
            ]);

            if (!appointmentsRes.ok) throw new Error('Randevu verileri çekilemedi.');
            if (!customersRes.ok) throw new Error('Müşteri verileri çekilemedi.');
            if (!needsRes.ok) throw new Error('İhtiyaç verileri çekilemedi.');

            const appointments = await appointmentsRes.json();
            const customers = await customersRes.json();
            const needs = await needsRes.json();

            console.log('Dashboard API Responses:', { appointments, customers, needs });

            // Verilerin array olduğundan emin ol
            const appointmentsArray = Array.isArray(appointments) ? appointments : [];
            const customersArray = Array.isArray(customers) ? customers : [];
            const needsArray = Array.isArray(needs) ? needs : [];

            // Mali hesaplamalar
            const completedAppointments = appointmentsArray.filter((a: any) => a.tamamlandimi);
            const totalRevenue = completedAppointments.reduce((sum: number, app: any) => sum + (app.ucret || 0), 0);
            
            // Bu ayki gelir hesaplama
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = completedAppointments
                .filter((app: any) => {
                    const appDate = new Date(app.createdAt);
                    return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
                })
                .reduce((sum: number, app: any) => sum + (app.ucret || 0), 0);

            const averageAppointmentValue = completedAppointments.length > 0 
                ? totalRevenue / completedAppointments.length 
                : 0;

            setStats({
                totalAppointments: appointmentsArray.length,
                pendingAppointments: appointmentsArray.filter((a: any) => !a.tamamlandimi).length,
                completedAppointments: completedAppointments.length,
                totalCustomers: customersArray.length,
                totalNeeds: needsArray.length,
                totalRevenue: totalRevenue,
                monthlyRevenue: monthlyRevenue,
                averageAppointmentValue: averageAppointmentValue,
            });

        } catch (err: any) {
            console.error('Dashboard fetch error:', err);
            setError(err.message);
            // Hata durumunda varsayılan değerler
            setStats({
                totalAppointments: 0,
                pendingAppointments: 0,
                completedAppointments: 0,
                totalCustomers: 0,
                totalNeeds: 0,
                totalRevenue: 0,
                monthlyRevenue: 0,
                averageAppointmentValue: 0,
            });
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
            
            {/* Genel İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Toplam Randevu" 
                    value={stats.totalAppointments} 
                    icon="fa-calendar-alt" 
                    color="border-blue-500" 
                />
                <StatCard 
                    title="Bekleyen Randevu" 
                    value={stats.pendingAppointments} 
                    icon="fa-hourglass-half" 
                    color="border-yellow-500" 
                />
                <StatCard 
                    title="Tamamlanan Randevu" 
                    value={stats.completedAppointments} 
                    icon="fa-check-circle" 
                    color="border-green-500" 
                />
                <StatCard 
                    title="Toplam Müşteri" 
                    value={stats.totalCustomers} 
                    icon="fa-users" 
                    color="border-purple-500" 
                />
            </div>

            {/* Mali Durum */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Mali Durum</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Toplam Gelir" 
                        value={`${stats.totalRevenue.toLocaleString('tr-TR')} TL`} 
                        icon="fa-money-bill-wave" 
                        color="border-green-500"
                        subtitle="Tüm zamanlar"
                    />
                    <StatCard 
                        title="Bu Ay Gelir" 
                        value={`${stats.monthlyRevenue.toLocaleString('tr-TR')} TL`} 
                        icon="fa-chart-line" 
                        color="border-blue-500"
                        subtitle="Bu ay"
                    />
                    <StatCard 
                        title="Ortalama Randevu" 
                        value={`${stats.averageAppointmentValue.toLocaleString('tr-TR')} TL`} 
                        icon="fa-calculator" 
                        color="border-orange-500"
                        subtitle="Tamamlanan randevular"
                    />
                </div>
            </div>

            {/* İhtiyaç Yönetimi */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">İhtiyaç Yönetimi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard 
                        title="Toplam İhtiyaç" 
                        value={stats.totalNeeds} 
                        icon="fa-box-open" 
                        color="border-indigo-500"
                        subtitle="Kayıtlı ihtiyaç türü"
                    />
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Hızlı İşlemler</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/admin/needs')}
                                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                                <i className="fas fa-plus mr-2"></i>Yeni İhtiyaç Ekle
                            </button>
                            <button 
                                onClick={() => navigate('/admin/appointments')}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <i className="fas fa-calendar-plus mr-2"></i>Yeni Randevu
                            </button>
                            <button 
                                onClick={() => navigate('/admin/customers')}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <i className="fas fa-user-plus mr-2"></i>Yeni Müşteri
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 