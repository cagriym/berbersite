import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// API'den gelen müşteri nesnesinin yapısını tanımla
interface Customer {
    musteriID: number;
    adSoyad: string;
    telefon: string;
    createdAt: string;
}

const CustomerModal = ({ customer, onClose, onSave, loading }: { customer: Partial<Customer> | null; onClose: () => void; onSave: (customer: Partial<Customer>) => void; loading: boolean; }) => {
    const [formData, setFormData] = useState(customer || {});

    useEffect(() => {
        setFormData(customer || {});
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!customer) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{formData.musteriID ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="adSoyad">Ad Soyad</label>
                        <input type="text" id="adSoyad" name="adSoyad" value={formData.adSoyad || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telefon">Telefon</label>
                        <input type="tel" id="telefon" name="telefon" value={formData.telefon || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">İptal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-gray-400">
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/Musteriler`);
            if (Array.isArray(response.data)) {
                setCustomers(response.data);
            } else {
                console.error('API`den beklenen dizi formatı gelmedi:', response.data);
                setCustomers([]);
            }
        } catch (error) {
            console.error('Müşteriler alınırken hata oluştu:', error);
            setError('Müşteri verileri alınamadı.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSave = async (customer: Partial<Customer>) => {
        setActionLoading(true);
        const method = customer.musteriID ? 'PUT' : 'POST';
        const url = customer.musteriID ? `${API_BASE_URL}/api/Musteriler/${customer.musteriID}` : `${API_BASE_URL}/api/Musteriler`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer)
            });
            if (!response.ok) throw new Error('Müşteri kaydedilemedi.');
            setIsModalOpen(false);
            setSelectedCustomer(null);
            await fetchCustomers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
        
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Musteriler/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Müşteri silinemedi.');
            await fetchCustomers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div></div>;
    if (error) return <div className="p-4 text-red-700 bg-red-100 rounded-lg">Hata: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Müşteri Yönetimi</h1>
                <button onClick={() => { setSelectedCustomer({}); setIsModalOpen(true); }} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold shadow-md">
                    <i className="fas fa-plus mr-2"></i>Yeni Müşteri
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-5 py-3">Ad Soyad</th>
                            <th className="px-5 py-3">Telefon</th>
                            <th className="px-5 py-3">Kayıt Tarihi</th>
                            <th className="px-5 py-3 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(customers) && customers.map(c => (
                            <tr key={c.musteriID} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-5 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{c.adSoyad}</p>
                                </td>
                                <td className="px-5 py-5 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{c.telefon}</p>
                                </td>
                                <td className="px-5 py-5 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</p>
                                </td>
                                <td className="px-5 py-5 text-sm text-right">
                                    <button onClick={() => { setSelectedCustomer(c); setIsModalOpen(true); }} className="text-amber-600 hover:text-amber-900 mr-4">Düzenle</button>
                                    <button onClick={() => handleDelete(c.musteriID)} className="text-red-600 hover:text-red-900">Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <CustomerModal customer={selectedCustomer} onClose={() => setIsModalOpen(false)} onSave={handleSave} loading={actionLoading} />}
        </div>
    );
};

export default Customers; 