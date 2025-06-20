import React, { useState, useEffect, useCallback } from 'react';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://oktay-sac-tasarim1.azurewebsites.net';

interface Personel {
    personelID: number;
    adSoyad: string;
    pozisyon: string;
    iseGirisTarihi: string;
}

const Personnel: React.FC = () => {
    const [personnelList, setPersonnelList] = useState<Personel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPersonnel, setCurrentPersonnel] = useState<Partial<Personel> | null>(null);

    const fetchPersonnel = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Personel`);
            if (!response.ok) throw new Error('Personel verileri yüklenemedi');
            const data = await response.json();
            setPersonnelList(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
            setPersonnelList([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPersonnel();
    }, [fetchPersonnel]);

    const handleOpenModal = (personel: Partial<Personel> | null = null) => {
        setCurrentPersonnel(personel ? { ...personel } : { adSoyad: '', pozisyon: '', iseGirisTarihi: new Date().toISOString() });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPersonnel(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentPersonnel) return;
        const { name, value } = e.target;
        setCurrentPersonnel({ ...currentPersonnel, [name]: value });
    };

    const handleSave = async () => {
        if (!currentPersonnel) return;

        const url = currentPersonnel.personelID
            ? `${API_BASE_URL}/api/Personel/${currentPersonnel.personelID}`
            : `${API_BASE_URL}/api/Personel`;
        
        const method = currentPersonnel.personelID ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentPersonnel),
            });

            if (!response.ok) {
                 const errorData = await response.text();
                 throw new Error(`Personel kaydedilemedi: ${errorData}`);
            }
            
            handleCloseModal();
            fetchPersonnel();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kaydetme sırasında bir hata oluştu');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/Personel/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Personel silinemedi');
                fetchPersonnel();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Silme sırasında bir hata oluştu');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold leading-tight">Personel Yönetimi</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        <FaUserPlus className="mr-2" /> Yeni Personel Ekle
                    </button>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">{error}</div>}
                
                {isLoading ? (
                    <p className="text-center mt-8">Yükleniyor...</p>
                ) : (
                    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ad Soyad</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pozisyon</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşe Giriş Tarihi</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {personnelList.map((p) => (
                                        <tr key={p.personelID}>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{p.adSoyad}</td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{p.pozisyon}</td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(p.iseGirisTarihi).toLocaleDateString()}</td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                                <button onClick={() => handleOpenModal(p)} className="text-indigo-600 hover:text-indigo-900 mr-3"><FaEdit /></button>
                                                <button onClick={() => handleDelete(p.personelID)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && currentPersonnel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{currentPersonnel.personelID ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="adSoyad" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                                <input type="text" name="adSoyad" id="adSoyad" value={currentPersonnel.adSoyad} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                            <div>
                                <label htmlFor="pozisyon" className="block text-sm font-medium text-gray-700">Pozisyon</label>
                                <input type="text" name="pozisyon" id="pozisyon" value={currentPersonnel.pozisyon} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">İptal</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Personnel; 