import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://oktay-sac-tasarim1.azurewebsites.net';

// Basitleştirilmiş ihtiyaç yapısı
interface Need {
    ihtiyacID: number;
    ihtiyacTuru: string;
    aciklama: string;
    fiyat: number;
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
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ihtiyacTuru">İhtiyaç Türü</label>
                        <input type="text" id="ihtiyacTuru" name="ihtiyacTuru" value={formData.ihtiyacTuru || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fiyat">Fiyat (TL)</label>
                        <input type="number" step="0.01" id="fiyat" name="fiyat" value={formData.fiyat || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aciklama">Açıklama</label>
                        <textarea id="aciklama" name="aciklama" value={formData.aciklama || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" rows={3} />
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

const Needs: React.FC = () => {
    const [needs, setNeeds] = useState<Need[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState<Partial<Need> | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchNeeds = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Needs`);
            if (!response.ok) throw new Error('İhtiyaç verileri çekilemedi.');

            const needsData = await response.json();
            console.log('Needs API Response:', needsData);

            setNeeds(Array.isArray(needsData) ? needsData : []);
            
            if (!Array.isArray(needsData)) console.error('Needs API`den beklenen dizi formatı gelmedi:', needsData);

        } catch (err: any) {
            setError(err.message);
            setNeeds([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNeeds();
    }, [fetchNeeds]);

    const handleSave = async (need: Partial<Need>) => {
        setActionLoading(true);
        const method = need.ihtiyacID ? 'PUT' : 'POST';
        const url = need.ihtiyacID ? `${API_BASE_URL}/api/Needs/${need.ihtiyacID}` : `${API_BASE_URL}/api/Needs`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(need)
            });
            if (!response.ok) throw new Error('İhtiyaç kaydedilemedi.');
            setIsModalOpen(false);
            setSelectedNeed(null);
            await fetchNeeds();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu ihtiyacı silmek istediğinize emin misiniz?')) return;
        
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Needs/${id}`, { method: 'DELETE' });
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
                <button onClick={() => { setSelectedNeed({}); setIsModalOpen(true); }} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold shadow-md">
                    <i className="fas fa-plus mr-2"></i>Yeni İhtiyaç
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-5 py-3">İhtiyaç Türü</th>
                            <th className="px-5 py-3">Fiyat</th>
                            <th className="px-5 py-3">Açıklama</th>
                            <th className="px-5 py-3">Eklenme Tarihi</th>
                            <th className="px-5 py-3 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(needs) && needs.length > 0 ? (
                            needs.map(n => (
                                <tr key={n.ihtiyacID} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-medium">{n.ihtiyacTuru}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-bold">{n.fiyat?.toLocaleString('tr-TR')} TL</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-gray-900">{n.aciklama || '-'}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{new Date(n.createdAt).toLocaleDateString('tr-TR')}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm text-right">
                                        <button onClick={() => { setSelectedNeed(n); setIsModalOpen(true); }} className="text-amber-600 hover:text-amber-900 mr-4">Düzenle</button>
                                        <button onClick={() => handleDelete(n.ihtiyacID)} className="text-red-600 hover:text-red-900">Sil</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-5 py-5 text-center text-gray-500">
                                    Henüz ihtiyaç kaydı bulunmuyor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <NeedModal need={selectedNeed} onClose={() => setIsModalOpen(false)} onSave={handleSave} loading={actionLoading} />}
        </div>
    );
};

export default Needs; 