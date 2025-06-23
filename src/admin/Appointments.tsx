import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://oktay-sac-tasarim1.azurewebsites.net';

// Swagger.json'a göre API yapıları
interface Appointment {
    randevuID: number;
    musteriID: number;
    musteri: {
        adSoyad: string;
        telefon: string;
    };
    randevuTarihi: string;
    randevuSaati: string;
    randevuZamani: string;
    randevuServisler: { 
        servisID: number;
        servisAdi: string; 
        varsayilanUcret: number | null; 
    }[];
    servisAdlari: string;
    aciklama: string | null;
    ucret: number;
    tamamlandimi: boolean;
    createdAt: string;
}

interface Service {
    servisID: number;
    servisAdi: string;
    varsayilanUcret: number | null;
}

interface Customer {
    musteriID: number;
    ad: string;
    soyad: string;
    telefon: string;
}

const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [searchDate, setSearchDate] = useState<string>('');
    const [searchTime, setSearchTime] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Yeni randevu oluşturma state'leri
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [description, setDescription] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
    const [conflictInfo, setConflictInfo] = useState<string>('');

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/api/Appointments`);
            if (!response.ok) throw new Error('Randevu verileri çekilemedi.');
            const data = await response.json();
            
            console.log('Appointments API Response:', data);
            
            if (Array.isArray(data)) {
                setAppointments(data);
                setFilteredAppointments(data);
            } else {
                console.error('Appointments API`den beklenen dizi formatı gelmedi:', data);
                setAppointments([]);
                setFilteredAppointments([]);
            }
        } catch (err: any) {
            setError(err.message);
            setAppointments([]);
            setFilteredAppointments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Servisleri getir
    const fetchServices = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Services`);
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Servisler yüklenirken hata:', error);
        }
    }, []);

    // Müşterileri getir
    const fetchCustomers = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Musteriler`);
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error('Müşteriler yüklenirken hata:', error);
        }
    }, []);

    // Müsait olmayan saatleri getir
    const getUnavailableTimes = useCallback(async (date: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Appointments`);
            if (response.ok) {
                const appointments = await response.json();
                const unavailableTimes: string[] = [];
                
                appointments.forEach((app: any) => {
                    const appDate = new Date(app.randevuZamani).toDateString();
                    const selectedDateObj = new Date(date).toDateString();
                    
                    if (appDate === selectedDateObj) {
                        const appTime = new Date(app.randevuZamani);
                        const appHour = appTime.getHours();
                        const appMinute = appTime.getMinutes();
                        
                        // Sadece randevu alınan saati müsait değil olarak işaretle
                        if (appHour >= 9 && appHour <= 20) {
                            const timeString = `${appHour.toString().padStart(2, '0')}:${appMinute.toString().padStart(2, '0')}`;
                            if (!unavailableTimes.includes(timeString)) {
                                unavailableTimes.push(timeString);
                            }
                        }
                    }
                });
                
                return unavailableTimes;
            }
        } catch (error) {
            console.error('Müsait olmayan saatler alınırken hata:', error);
        }
        return [];
    }, []);

    // Randevu çakışması kontrolü
    const checkAppointmentConflict = useCallback(async (date: string, time: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Appointments`);
            if (response.ok) {
                const appointments = await response.json();
                const selectedDateTime = new Date(`${date}T${time}`);
                const selectedDate = selectedDateTime.toDateString();
                
                const conflict = appointments.find((app: any) => {
                    const appDateTime = new Date(app.randevuZamani);
                    const appDate = appDateTime.toDateString();
                    
                    if (appDate !== selectedDate) return false;
                    
                    const timeDiff = Math.abs(appDateTime.getTime() - selectedDateTime.getTime());
                    const thirtyMinutes = 30 * 60 * 1000;
                    
                    return timeDiff < thirtyMinutes;
                });
                
                if (conflict) {
                    setConflictInfo(`Bu saatte ${conflict.musteri.adSoyad} adlı müşterinin randevusu bulunmaktadır. Randevu üstüne yazılacak ve mevcut randevu iptal edilecektir.`);
                    return conflict;
                } else {
                    setConflictInfo('');
                    return null;
                }
            }
        } catch (error) {
            console.error('Randevu çakışması kontrol edilirken hata:', error);
        }
        return null;
    }, []);

    // Tarih değiştiğinde müsait olmayan saatleri güncelle
    useEffect(() => {
        if (selectedDate) {
            getUnavailableTimes(selectedDate).then(setUnavailableTimes);
        }
    }, [selectedDate, getUnavailableTimes]);

    // Saat değiştiğinde çakışma kontrolü yap
    useEffect(() => {
        if (selectedDate && selectedTime) {
            checkAppointmentConflict(selectedDate, selectedTime);
        }
    }, [selectedDate, selectedTime, checkAppointmentConflict]);

    // Toplam ücreti hesapla
    useEffect(() => {
        const total = services
            .filter(s => selectedServices.includes(s.servisID))
            .reduce((sum, s) => sum + (s.varsayilanUcret || 0), 0);
        setTotalPrice(total);
    }, [selectedServices, services]);

    // Modal açıldığında verileri yükle
    useEffect(() => {
        if (showCreateModal) {
            fetchServices();
            fetchCustomers();
            getUnavailableTimes(selectedDate).then(setUnavailableTimes);
        }
    }, [showCreateModal, fetchServices, fetchCustomers, getUnavailableTimes, selectedDate]);

    // Tarih, saat ve metin arama fonksiyonu
    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        let filtered = appointments;

        if (lowercasedSearchTerm) {
            filtered = filtered.filter(app =>
                (app.musteri?.adSoyad?.toLowerCase().includes(lowercasedSearchTerm)) ||
                (app.musteri?.telefon?.toLowerCase().includes(lowercasedSearchTerm)) ||
                (app.servisAdlari?.toLowerCase().includes(lowercasedSearchTerm))
            );
        }

        if (searchDate) {
            const searchDateObj = new Date(searchDate);
            filtered = filtered.filter(app => {
                const appDate = new Date(app.randevuZamani);
                return appDate.toDateString() === searchDateObj.toDateString();
            });
        }

        if (searchTime) {
            filtered = filtered.filter(app => {
                const appTime = new Date(app.randevuZamani);
                const appHour = appTime.getHours().toString().padStart(2, '0');
                const appMinute = appTime.getMinutes().toString().padStart(2, '0');
                const appTimeString = `${appHour}:${appMinute}`;
                return appTimeString.includes(searchTime);
            });
        }

        setFilteredAppointments(filtered);
    }, [appointments, searchDate, searchTime, searchTerm]);

    // Son randevuları alma (son 10 randevu)
    const recentAppointments = appointments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    const handleAction = async (randevuID: number, action: 'complete' | 'delete') => {
        if (action === 'delete' && !window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
            return;
        }
        
        setActionLoading(randevuID);
        try {
            const url = action === 'complete' 
                ? `${API_BASE_URL}/Appointments/${randevuID}/complete`
                : `${API_BASE_URL}/Appointments/${randevuID}`;
            
            const method = action === 'complete' ? 'PUT' : 'DELETE';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: action === 'complete' ? JSON.stringify(true) : undefined,
            });

            if (!response.ok) {
                throw new Error(`İşlem başarısız: ${action}`);
            }
            
            await fetchAppointments();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    // Randevu oluşturma fonksiyonu
    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        
        try {
            // Form validasyonu
            if (!selectedCustomer && (!newCustomerName.trim() || !newCustomerPhone.trim())) {
                setError('Lütfen müşteri seçin veya yeni müşteri bilgilerini girin.');
                return;
            }
            
            if (selectedServices.length === 0) {
                setError('Lütfen en az bir servis seçin.');
                return;
            }

            // Çakışma kontrolü
            const conflict = await checkAppointmentConflict(selectedDate, selectedTime);
            
            // Eğer çakışma varsa, mevcut randevuyu iptal et
            if (conflict) {
                try {
                    const cancelResponse = await fetch(`${API_BASE_URL}/Appointments/${conflict.randevuID}/cancel`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    
                    if (cancelResponse.ok) {
                        const cancelData = await cancelResponse.json();
                        console.log('Randevu iptal edildi:', cancelData);
                    } else {
                        // Eğer cancel endpoint'i çalışmazsa, normal delete kullan
                        await fetch(`${API_BASE_URL}/Appointments/${conflict.randevuID}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                        });
                    }
                } catch (error) {
                    console.error('Mevcut randevu iptal edilirken hata:', error);
                }
            }

            // Müşteri bilgilerini hazırla
            let customerData;
            if (selectedCustomer) {
                const customer = customers.find(c => c.musteriID.toString() === selectedCustomer);
                if (customer) {
                    customerData = {
                        Ad: customer.ad,
                        Soyad: customer.soyad,
                        Telefon: customer.telefon
                    };
                }
            } else {
                customerData = {
                    Ad: newCustomerName.split(' ')[0] || newCustomerName,
                    Soyad: newCustomerName.split(' ').slice(1).join(' ') || '',
                    Telefon: newCustomerPhone
                };
            }

            // Randevu oluştur
            const appointmentData = {
                Customer: customerData,
                Appointment: {
                    ServisIDList: selectedServices,
                    RandevuZamani: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
                    Aciklama: description,
                    Ucret: totalPrice
                }
            };

            const response = await fetch(`${API_BASE_URL}/Appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Randevu oluşturulamadı.');
            }

            // Başarılı
            setShowCreateModal(false);
            setError(null);
            await fetchAppointments();
            
            // Form temizle
            setSelectedCustomer('');
            setNewCustomerName('');
            setNewCustomerPhone('');
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setSelectedTime('09:00');
            setSelectedServices([]);
            setDescription('');
            setConflictInfo('');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    // Servis adlarını güvenli şekilde gösterme fonksiyonu
    const getServiceNames = (appointment: Appointment) => {
        if (appointment.servisAdlari && appointment.servisAdlari.trim()) {
            return appointment.servisAdlari;
        }
        
        if (appointment.randevuServisler && appointment.randevuServisler.length > 0) {
            return appointment.randevuServisler.map(rs => rs.servisAdi || 'Bilinmeyen Servis').join(', ');
        }
        
        return 'Servis bilgisi yok';
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );
    if (error) return <div className="p-4 text-red-700 bg-red-100 rounded-lg">Hata: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Randevu Yönetimi</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                    <i className="fas fa-plus mr-2"></i>
                    Yeni Randevu
                </button>
            </div>
            
            {/* Arama Bölümü */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Randevu Arama</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri, Telefon, Servis Ara</label>
                        <input
                            type="text"
                            placeholder="Arama yap..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Ara</label>
                        <input
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Saat Ara</label>
                        <input
                            type="time"
                            value={searchTime}
                            onChange={(e) => setSearchTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>
                 <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => { setSearchDate(''); setSearchTime(''); setSearchTerm(''); }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Temizle
                        </button>
                    </div>
            </div>

            {/* Son Randevular */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Son Randevular</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentAppointments.slice(0, 6).map((app) => (
                        <div key={app.randevuID} className={`border rounded-lg p-4 ${app.tamamlandimi ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800">{app.musteri?.adSoyad || 'Bilinmeyen'}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${app.tamamlandimi ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {app.tamamlandimi ? 'Tamamlandı' : 'Bekliyor'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">{app.randevuTarihi} {app.randevuSaati}</p>
                            <p className="text-sm text-gray-500">{app.musteri?.telefon}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tüm Randevular */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Tüm Randevular ({filteredAppointments.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((app) => (
                            <div key={app.randevuID} className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${app.tamamlandimi ? 'opacity-60' : ''}`}>
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg text-gray-800">{app.musteri?.adSoyad || 'Bilinmeyen'}</p>
                                            <p className="text-sm text-gray-500">{app.musteri?.telefon}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${app.tamamlandimi ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {app.tamamlandimi ? 'Tamamlandı' : 'Bekliyor'}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-gray-600">Randevu Tarihi:</p>
                                        <p className="text-gray-800">{app.randevuTarihi} {app.randevuSaati}</p>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-gray-600">İstenen Servisler:</p>
                                        <p className="text-gray-700">{getServiceNames(app)}</p>
                                    </div>

                                    {app.aciklama && <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-600 italic">{app.aciklama}</p>
                                    </div>}
                                </div>
                                <div className="px-5 py-3 bg-gray-50 flex justify-end gap-3">
                                    {!app.tamamlandimi && (
                                        <button
                                            onClick={() => handleAction(app.randevuID, 'complete')}
                                            disabled={actionLoading === app.randevuID}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                        >
                                            {actionLoading === app.randevuID ? '...' : 'Onayla'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAction(app.randevuID, 'delete')}
                                        disabled={actionLoading === app.randevuID}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        {actionLoading === app.randevuID ? '...' : 'Sil'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            {searchDate || searchTime ? 'Arama kriterlerine uygun randevu bulunamadı.' : 'Henüz randevu kaydı bulunmuyor.'}
                        </div>
                    )}
                </div>
            </div>

            {/* Randevu Oluşturma Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-xl overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Yeni Randevu Oluştur</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {conflictInfo && (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    {conflictInfo}
                                </div>
                            )}

                            <form onSubmit={handleCreateAppointment} className="space-y-4">
                                {/* Müşteri Seçimi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri</label>
                                    <select
                                        value={selectedCustomer}
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">Müşteri Seçin</option>
                                        {customers.map(customer => (
                                            <option key={customer.musteriID} value={customer.musteriID}>
                                                {customer.ad} {customer.soyad} - {customer.telefon}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Yeni Müşteri Bilgileri */}
                                {!selectedCustomer && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                                            <input
                                                type="text"
                                                value={newCustomerName}
                                                onChange={(e) => setNewCustomerName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                placeholder="Ad Soyad"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                                            <input
                                                type="tel"
                                                value={newCustomerPhone}
                                                onChange={(e) => setNewCustomerPhone(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                placeholder="5XX XXX XX XX"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Tarih ve Saat */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Saat</label>
                                        <select
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            {Array.from({ length: 24 }, (_, hour) => 
                                                Array.from({ length: 2 }, (_, minute) => {
                                                    const time = `${hour.toString().padStart(2, '0')}:${(minute * 30).toString().padStart(2, '0')}`;
                                                    const isAvailable = !unavailableTimes.includes(time);
                                                    return (
                                                        <option
                                                            key={time}
                                                            value={time}
                                                            disabled={!isAvailable}
                                                            className={!isAvailable ? 'text-gray-400' : ''}
                                                        >
                                                            {time} {!isAvailable ? '(Müsait Değil)' : ''}
                                                        </option>
                                                    );
                                                })
                                            ).flat()}
                                        </select>
                                    </div>
                                </div>

                                {/* Servisler */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Servisler</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {services.map(service => (
                                            <label key={service.servisID} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedServices.includes(service.servisID)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedServices([...selectedServices, service.servisID]);
                                                        } else {
                                                            setSelectedServices(selectedServices.filter(id => id !== service.servisID));
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                                <span className="text-sm">
                                                    {service.servisAdi} - {service.varsayilanUcret?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || 'Ücret Belirtilmemiş'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Açıklama */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        rows={3}
                                        placeholder="Randevu açıklaması..."
                                    />
                                </div>

                                {/* Toplam Ücret */}
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-800">
                                        Toplam: {totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </p>
                                </div>

                                {/* Butonlar */}
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {createLoading ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments; 