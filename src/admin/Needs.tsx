import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://oktay-sac-tasarim1.azurewebsites.net/api';

// Basitleştirilmiş ihtiyaç yapısı
interface Need {
    ihtiyacID: number;
    ad: string;
    fiyat: number;
    aciklama: string | null;
    createdAt: string;
}

const NeedModal = ({ need, onClose, onSave, loading }: { need: Partial<Need> | null; onClose: () => void; onSave: (need: Partial<Need>) => void; loading: boolean; }) => {
    const [formData, setFormData] = useState(need || {});

    useEffect(() => {
        setFormData(need || {});
    }, [need]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'fiyat' ? Number(value) : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!need) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{formData.ihtiyacID ? 'İhtiyacı Düzenle' : 'Yeni İhtiyaç Ekle'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="ad" className="block text-sm font-medium text-gray-700">İsim</label>
                            <input
                                type="text"
                                name="ad"
                                id="ad"
                                value={formData.ad || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="fiyat" className="block text-sm font-medium text-gray-700">Fiyat</label>
                            <input
                                type="number"
                                name="fiyat"
                                id="fiyat"
                                value={formData.fiyat || 0}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700">Açıklama</label>
                            <textarea
                                name="aciklama"
                                id="aciklama"
                                rows={3}
                                value={formData.aciklama || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">İptal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Needs: React.FC = () => {
    const [needs, setNeeds] = useState<Need[]>([]);
    const [filteredNeeds, setFilteredNeeds] = useState<Need[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState<Partial<Need> | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNeeds = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/Needs`);
            if (!response.ok) throw new Error('İhtiyaçlar yüklenemedi');
            const data = await response.json();
            if (Array.isArray(data)) {
                const mapped = data.map((item: any) => ({
                    ...item,
                    ad: item.ad || item.ihtiyacTuru || ''
                }));
                setNeeds(mapped);
            } else {
                console.error("API'den beklenen dizi formatı gelmedi:", data);
                setNeeds([]); // Hata durumunda boş dizi ata
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
            setNeeds([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNeeds();
    }, [fetchNeeds]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowercasedSearchTerm) {
            setFilteredNeeds(needs);
            return;
        }

        const filtered = needs.filter(need =>
            need.ad.toLowerCase().includes(lowercasedSearchTerm) ||
            (need.aciklama && need.aciklama.toLowerCase().includes(lowercasedSearchTerm))
        );
        setFilteredNeeds(filtered);
    }, [searchTerm, needs]);

    const handleSave = async () => {
        if (!selectedNeed) return;

        const url = selectedNeed.ihtiyacID
            ? `${API_BASE_URL}/Needs/${selectedNeed.ihtiyacID}`
            : `${API_BASE_URL}/Needs`;

        const method = selectedNeed.ihtiyacID ? 'PUT' : 'POST';

        const needData = {
            ihtiyacTuru: selectedNeed.ad,
            fiyat: selectedNeed.fiyat,
            aciklama: selectedNeed.aciklama,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(needData)
            });
            if (!response.ok) throw new Error('İhtiyaç kaydedilemedi');
            setIsModalOpen(false);
            setSelectedNeed(null);
            await fetchNeeds();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu ihtiyacı silmek istediğinize emin misiniz?')) return;
        
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Needs/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('İhtiyaç silinemedi.');
            await fetchNeeds();
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
                <h1 className="text-3xl font-bold text-gray-800">İhtiyaç ve Fiyat Yönetimi</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="İhtiyaç Ara (Ad, Açıklama)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <button onClick={() => { setSelectedNeed({}); setIsModalOpen(true); }} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold shadow-md flex items-center">
                        <i className="fas fa-plus mr-2"></i>Yeni İhtiyaç
                    </button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oluşturma Tarihi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredNeeds.map((need) => (
                            <tr key={need.ihtiyacID}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{need.ad}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {need.fiyat ? `${need.fiyat.toFixed(2)} TL` : 'Belirtilmemiş'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{need.aciklama || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(need.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => { setSelectedNeed(need); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Düzenle</button>
                                    <button onClick={() => handleDelete(need.ihtiyacID)} className="text-red-600 hover:text-red-900">Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <NeedModal need={selectedNeed} onClose={() => setIsModalOpen(false)} onSave={handleSave} loading={actionLoading} />}
        </div>
    );
};

export default Needs; 