import React, { useState, useEffect, useCallback } from 'react';

// API'den gelen randevu nesnesinin yapısını tanımla
interface Appointment {
    randevuID: number;
    musteri: {
        adSoyad: string;
        telefon: string;
    };
    randevuTarihi: string;
    randevuServisler: { servisAdi: string; varsayilanUcret: number | null; }[];
    aciklama: string | null;
    ucret: number;
    tamamlandimi: boolean;
}

const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/api/Appointments`);
            if (!response.ok) throw new Error('Randevu verileri çekilemedi.');
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setAppointments(data);
            } else {
                console.error('Appointments API’den beklenen dizi formatı gelmedi:', data);
                setAppointments([]);
            }
        } catch (err: any) {
            setError(err.message);
            setAppointments([]); // Hata durumunda boşalt
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

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

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );
    if (error) return <div className="p-4 text-red-700 bg-red-100 rounded-lg">Hata: {error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Randevu Yönetimi</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(appointments) && appointments.map((app) => (
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
                                <p className="text-gray-800">{new Date(app.randevuTarihi).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                            </div>
                            
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-gray-600">İstenen Servisler:</p>
                                <ul className="list-disc list-inside text-gray-700">
                                    {Array.isArray(app.randevuServisler) && app.randevuServisler.map(s => <li key={s.servisAdi}>{s.servisAdi} ({s.varsayilanUcret?.toLocaleString('tr-TR')} TL)</li>)}
                                </ul>
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
                ))}
            </div>
        </div>
    );
};

export default Appointments; 