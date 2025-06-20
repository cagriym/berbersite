import React, { useState, useEffect } from 'react';

// API'den gelen ihtiyaç nesnesinin yapısını tanımla
interface Need {
    ihtiyacID: number;
    musteriID: number;
    ihtiyacTuru: string;
    aciklama: string;
    createdAt: string;
    musteri: {
        adSoyad: string;
        telefon: string;
    };
}

const Needs: React.FC = () => {
    const [needs, setNeeds] = useState<Need[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchNeeds = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/Needs`);
                if (!response.ok) {
                    throw new Error(`Veri çekme başarısız: ${response.status}`);
                }
                const data: Need[] = await response.json();
                setNeeds(data);
            } catch (err: any) {
                setError(err.message || 'İhtiyaçları çekerken bir hata oluştu.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNeeds();
    }, [API_BASE_URL]);

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4">Müşteri İhtiyaçları</h2>

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
                                <th>İhtiyaç Türü</th>
                                <th>Açıklama</th>
                                <th>Eklendiği Tarih</th>
                            </tr>
                        </thead>
                        <tbody>
                            {needs.map((need, index) => (
                                <tr key={need.ihtiyacID}>
                                    <td>{index + 1}</td>
                                    <td>{need.musteri.adSoyad}</td>
                                    <td>{need.musteri.telefon}</td>
                                    <td>{need.ihtiyacTuru}</td>
                                    <td>{need.aciklama}</td>
                                    <td>{new Date(need.createdAt).toLocaleString('tr-TR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Needs; 