import React, { useState, useEffect } from 'react';

// API'den gelen müşteri nesnesinin yapısını tanımla
interface Customer {
    musteriID: number;
    adSoyad: string;
    telefon: string;
    createdAt: string;
}

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/Musteriler`);
                if (!response.ok) {
                    throw new Error(`Veri çekme başarısız: ${response.status}`);
                }
                const data: Customer[] = await response.json();
                setCustomers(data);
            } catch (err: any) {
                setError(err.message || 'Müşterileri çekerken bir hata oluştu.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [API_BASE_URL]);

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4">Tüm Müşteriler</h2>

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
                                <th>Ad Soyad</th>
                                <th>Telefon Numarası</th>
                                <th>Kayıt Tarihi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer, index) => (
                                <tr key={customer.musteriID}>
                                    <td>{index + 1}</td>
                                    <td>{customer.adSoyad}</td>
                                    <td>{customer.telefon}</td>
                                    <td>{new Date(customer.createdAt).toLocaleDateString('tr-TR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Customers; 