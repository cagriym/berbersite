import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://oktay-sac-tasarim1.azurewebsites.net/api';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    change?: string;
}

interface FinancialData {
    year: number;
    month: number;
    monthName: string;
    income: number;
    expenses: number;
    netProfit: number;
    breakdown: {
        salary: number;
        needs: number;
        appointments: number;
    };
}

interface MonthOption {
    year: number;
    month: number;
    name: string;
    isCurrent: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {change && (
                    <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {change}
                    </p>
                )}
            </div>
            <div className="text-3xl text-gray-400">{icon}</div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [financialData, setFinancialData] = useState<FinancialData | null>(null);
    const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [appointmentsRes, customersRes, needsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/Appointments`),
                fetch(`${API_BASE_URL}/Musteriler`),
                fetch(`${API_BASE_URL}/Needs`),
            ]);

            if (!appointmentsRes.ok || !customersRes.ok || !needsRes.ok) {
                throw new Error('Veriler yüklenemedi');
            }

            const [appointmentsData, customersData, needsData] = await Promise.all([
                appointmentsRes.json(),
                customersRes.json(),
                needsRes.json(),
            ]);

            // Veri doğrulama
            const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
            const customers = Array.isArray(customersData) ? customersData : [];
            const needs = Array.isArray(needsData) ? needsData : [];

            // İstatistikleri hesapla
            const totalAppointments = appointments.length;
            const totalCustomers = customers.length;
            const totalNeeds = needs.length;

            // Gelir hesaplama (sadece tamamlanmış randevular)
            const totalRevenue = appointments
                .filter((app: any) => app.tamamlandimi)
                .reduce((sum: number, app: any) => {
                    return sum + (app.ucret || 0);
                }, 0);

            // Aylık gelir (bu ay, sadece tamamlanmış randevular)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = appointments
                .filter((app: any) => {
                    const appDate = new Date(app.randevuZamani);
                    return appDate.getMonth() === currentMonth && 
                           appDate.getFullYear() === currentYear && 
                           app.tamamlandimi;
                })
                .reduce((sum: number, app: any) => sum + (app.ucret || 0), 0);

            // Ortalama randevu değeri (sadece tamamlanmış randevular)
            const completedAppointments = appointments.filter((app: any) => app.tamamlandimi);
            const avgAppointmentValue = completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0;

            setStats({
                totalAppointments,
                totalCustomers,
                totalNeeds,
                totalRevenue,
                monthlyRevenue,
                avgAppointmentValue
            });

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFinancialData = useCallback(async (year: number, month: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Personel/financial?year=${year}&month=${month}`);
            if (response.ok) {
                const data = await response.json();
                setFinancialData(data);
            }
        } catch (error) {
            console.error('Mali veriler yüklenemedi:', error);
        }
    }, []);

    const fetchAvailableMonths = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Personel/financial/months`);
            if (response.ok) {
                const data = await response.json();
                setAvailableMonths(data.months);
                
                // Varsayılan olarak bu ayı seç
                const currentMonth = data.months.find((m: MonthOption) => m.isCurrent);
                if (currentMonth) {
                    setSelectedMonth({ year: currentMonth.year, month: currentMonth.month });
                    fetchFinancialData(currentMonth.year, currentMonth.month);
                }
            }
        } catch (error) {
            console.error('Ay listesi yüklenemedi:', error);
        }
    }, [fetchFinancialData]);

    useEffect(() => {
        fetchData();
        fetchAvailableMonths();
    }, [fetchData, fetchAvailableMonths]);

    const handleMonthChange = (year: number, month: number) => {
        setSelectedMonth({ year, month });
        fetchFinancialData(year, month);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Başlık */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Gösterge Paneli</h1>
                <div className="text-sm text-gray-500">
                    Son güncelleme: {new Date().toLocaleString('tr-TR')}
                </div>
            </div>

            {/* Genel İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Toplam Randevu"
                    value={stats?.totalAppointments || 0}
                    icon={<FaCalendarAlt />}
                    color="border-blue-500"
                />
                <StatCard
                    title="Toplam Müşteri"
                    value={stats?.totalCustomers || 0}
                    icon={<FaUsers />}
                    color="border-green-500"
                />
                <StatCard
                    title="Toplam Gelir"
                    value={`${(stats?.totalRevenue || 0).toLocaleString()} ₺`}
                    icon={<FaMoneyBillWave />}
                    color="border-yellow-500"
                />
                <StatCard
                    title="Aylık Gelir"
                    value={`${(stats?.monthlyRevenue || 0).toLocaleString()} ₺`}
                    icon={<FaChartLine />}
                    color="border-purple-500"
                />
            </div>

            {/* Mali Durum Bölümü */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Mali Durum</h2>
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Ay Seçin:</label>
                        <select
                            value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : ''}
                            onChange={(e) => {
                                const [year, month] = e.target.value.split('-').map(Number);
                                handleMonthChange(year, month);
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {availableMonths.map((month) => (
                                <option key={`${month.year}-${month.month}`} value={`${month.year}-${month.month}`}>
                                    {month.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {financialData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Gelir */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Toplam Gelir</p>
                                    <p className="text-2xl font-bold text-green-800">
                                        {financialData.income.toLocaleString()} ₺
                                    </p>
                                </div>
                                <FaArrowUp className="text-green-600 text-2xl" />
                            </div>
                            <p className="text-xs text-green-600 mt-1">Randevu gelirleri</p>
                        </div>

                        {/* Giderler */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Toplam Gider</p>
                                    <p className="text-2xl font-bold text-red-800">
                                        {financialData.expenses.toLocaleString()} ₺
                                    </p>
                                </div>
                                <FaArrowDown className="text-red-600 text-2xl" />
                            </div>
                            <div className="text-xs text-red-600 mt-1">
                                <p>Maaş: {financialData.breakdown.salary.toLocaleString()} ₺</p>
                                <p>İhtiyaçlar: {financialData.breakdown.needs.toLocaleString()} ₺</p>
                            </div>
                        </div>

                        {/* Net Kar/Zarar */}
                        <div className={`p-4 rounded-lg border ${
                            financialData.netProfit >= 0 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Net Kar/Zarar</p>
                                    <p className={`text-2xl font-bold ${
                                        financialData.netProfit >= 0 ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                        {financialData.netProfit >= 0 ? '+' : ''}{financialData.netProfit.toLocaleString()} ₺
                                    </p>
                                </div>
                                {financialData.netProfit >= 0 ? (
                                    <FaArrowUp className="text-green-600 text-2xl" />
                                ) : (
                                    <FaArrowDown className="text-red-600 text-2xl" />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Hızlı İşlemler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
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

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Detaylı İstatistikler</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Ortalama Randevu Değeri:</span>
                            <span className="font-semibold">{stats?.avgAppointmentValue?.toFixed(2) || 0} ₺</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Toplam İhtiyaç:</span>
                            <span className="font-semibold">{stats?.totalNeeds || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Aktif Müşteri Oranı:</span>
                            <span className="font-semibold">
                                {stats?.totalCustomers > 0 ? Math.round((stats.totalAppointments / stats.totalCustomers) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 