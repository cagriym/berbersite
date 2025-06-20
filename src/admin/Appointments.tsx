import React, { useState, useEffect } from 'react';

// API'den gelen randevu nesnesinin yapısını tanımla
interface Appointment {
    randevuID: number;
    musteriID: number;
    randevuTarihi: string;
    aciklama: string | null;
    createdAt: string;
    musteri: {
        adSoyad: string;
        telefon: string;
    };
    randevuServisler: {
        servis: {
            ad: string;
        }
    }[];
}

const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/Appointments`);
                if (!response.ok) {
                    throw new Error(`Veri çekme başarısız: ${response.status}`);
                }
                const data: Appointment[] = await response.json();
                setAppointments(data);
            } catch (err: any) {
                setError(err.message || 'Randevuları çekerken bir hata oluştu.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [API_BASE_URL]);

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4">Tüm Randevular</h2>

            {loading && (
                 <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                   <p>Yükleniyor...</p>
                </div>
            )}

            {error && <div className="alert alert-danger">Hata: {error}</div>}

            {!loading && !error && (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>#</th>
                                <th>Müşteri Adı</th>
                                <th>Telefon</th>
                                <th>Randevu Tarihi</th>
                                <th>İstenen Servisler</th>
                                <th>Açıklama</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((app, index) => (
                                <tr key={app.randevuID}>
                                    <td>{index + 1}</td>
                                    <td>{app.musteri.adSoyad}</td>
                                    <td>{app.musteri.telefon}</td>
                                    <td>{new Date(app.randevuTarihi).toLocaleString('tr-TR')}</td>
                                    <td>
                                        {app.randevuServisler.map(rs => rs.servis.ad).join(', ')}
                                    </td>
                                    <td>{app.aciklama || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Appointments; 