import React, { useState, useEffect, useCallback } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaChartBar, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://oktay-sac-tasarim1.azurewebsites.net/api';

interface Personel {
    personelID: number;
    adSoyad: string;
    pozisyon: string;
    telefon?: string;
    email?: string;
    maas?: number;
    aktif: boolean;
    iseGirisTarihi: string;
    aciklama?: string;
}

interface PersonelStats {
    total: number;
    aktif: number;
    pasif: number;
    ortalamaMaas: number;
    pozisyonStats: Array<{ pozisyon: string; sayi: number }>;
}

interface PositionData {
    allPositions: string[];
    availablePositions: string[];
    occupiedSinglePositions: string[];
}

const Personnel: React.FC = () => {
    const [personnelList, setPersonnelList] = useState<Personel[]>([]);
    const [filteredList, setFilteredList] = useState<Personel[]>([]);
    const [stats, setStats] = useState<PersonelStats | null>(null);
    const [positions, setPositions] = useState<PositionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPersonnel, setCurrentPersonnel] = useState<Partial<Personel> | null>(null);
    
    // Filtreleme ve arama state'leri
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'position'>('date');

    const fetchPositions = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Personel/positions`);
            if (response.ok) {
                const data = await response.json();
                setPositions(data);
            }
        } catch (err) {
            console.error('Pozisyonlar yüklenemedi:', err);
        }
    }, []);

    const fetchPersonnel = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'all') params.append('aktif', statusFilter === 'active' ? 'true' : 'false');
            
            const response = await fetch(`${API_BASE_URL}/Personel?${params}`);
            if (!response.ok) throw new Error('Personel verileri yüklenemedi');
            const data = await response.json();
            setPersonnelList(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
            setPersonnelList([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, statusFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Personel/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('İstatistikler yüklenemedi:', err);
        }
    }, []);

    useEffect(() => {
        fetchPositions();
        fetchPersonnel();
        fetchStats();
    }, [fetchPersonnel, fetchStats, fetchPositions]);

    // Filtreleme ve sıralama
    useEffect(() => {
        let filtered = [...personnelList];
        
        // Sıralama
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.adSoyad.localeCompare(b.adSoyad);
                case 'position':
                    return a.pozisyon.localeCompare(b.pozisyon);
                case 'date':
                default:
                    return new Date(b.iseGirisTarihi).getTime() - new Date(a.iseGirisTarihi).getTime();
            }
        });
        
        setFilteredList(filtered);
    }, [personnelList, sortBy]);

    const handleOpenModal = (personel: Partial<Personel> | null = null) => {
        setCurrentPersonnel(personel ? { ...personel } : { 
            adSoyad: '', 
            pozisyon: '', 
            telefon: '',
            email: '',
            maas: 0,
            aktif: true,
            aciklama: '',
            iseGirisTarihi: new Date().toISOString() 
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPersonnel(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!currentPersonnel) return;
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setCurrentPersonnel({ ...currentPersonnel, [name]: checked });
        } else if (type === 'number') {
            setCurrentPersonnel({ ...currentPersonnel, [name]: value ? parseFloat(value) : 0 });
        } else {
            setCurrentPersonnel({ ...currentPersonnel, [name]: value });
        }
    };

    const handleSave = async () => {
        if (!currentPersonnel) return;

        const url = currentPersonnel.personelID
            ? `${API_BASE_URL}/Personel/${currentPersonnel.personelID}`
            : `${API_BASE_URL}/Personel`;
        
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
            fetchStats();
            fetchPositions(); // Pozisyon listesini yenile
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kaydetme sırasında bir hata oluştu');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/Personel/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Personel silinemedi');
                fetchPersonnel();
                fetchStats();
                fetchPositions(); // Pozisyon listesini yenile
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Silme sırasında bir hata oluştu');
            }
        }
    };

    const handleStatusToggle = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`${API_BASE_URL}/Personel/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(!currentStatus),
            });
            if (!response.ok) throw new Error('Durum güncellenemedi');
            fetchPersonnel();
            fetchStats();
            fetchPositions(); // Pozisyon listesini yenile
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Durum güncelleme sırasında bir hata oluştu');
        }
    };

    // Mevcut personelin pozisyonunu da dahil et
    const getAvailablePositions = () => {
        if (!positions) return [];
        
        const available = [...positions.availablePositions];
        
        // Eğer düzenleme modundaysa, mevcut pozisyonu da ekle
        if (currentPersonnel?.personelID && currentPersonnel?.pozisyon) {
            if (!available.includes(currentPersonnel.pozisyon)) {
                available.push(currentPersonnel.pozisyon);
            }
        }
        
        return available.sort();
    };

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold leading-tight">Personel Yönetimi</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        <FaUserPlus className="mr-2" /> Yeni Personel Ekle
                    </button>
                </div>

                {/* İstatistikler */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <div className="flex items-center">
                                <FaChartBar className="text-blue-600 mr-2" />
                                <div>
                                    <p className="text-sm text-blue-600">Toplam Personel</p>
                                    <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                            <div className="flex items-center">
                                <FaToggleOn className="text-green-600 mr-2" />
                                <div>
                                    <p className="text-sm text-green-600">Aktif</p>
                                    <p className="text-2xl font-bold text-green-800">{stats.aktif}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg">
                            <div className="flex items-center">
                                <FaToggleOff className="text-red-600 mr-2" />
                                <div>
                                    <p className="text-sm text-red-600">Pasif</p>
                                    <p className="text-2xl font-bold text-red-800">{stats.pasif}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-lg">
                            <div className="flex items-center">
                                <FaChartBar className="text-yellow-600 mr-2" />
                                <div>
                                    <p className="text-sm text-yellow-600">Ortalama Maaş</p>
                                    <p className="text-2xl font-bold text-yellow-800">{stats.ortalamaMaas.toLocaleString()} ₺</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pozisyon İstatistikleri */}
                {stats?.pozisyonStats && stats.pozisyonStats.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Pozisyon Dağılımı</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.pozisyonStats.map((stat) => (
                                <div key={stat.pozisyon} className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">{stat.sayi}</div>
                                    <div className="text-sm text-gray-600">{stat.pozisyon}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filtreler */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="İsim veya pozisyon ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tümü</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'position')}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="date">Tarihe Göre</option>
                                <option value="name">İsme Göre</option>
                                <option value="position">Pozisyona Göre</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4">Yükleniyor...</p>
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maaş</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşe Giriş</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredList.map((p) => (
                                        <tr key={p.personelID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{p.adSoyad}</div>
                                                    <div className="text-sm text-gray-500">{p.pozisyon}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{p.telefon || '-'}</div>
                                                <div className="text-sm text-gray-500">{p.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {p.maas ? `${p.maas.toLocaleString()} ₺` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleStatusToggle(p.personelID, p.aktif)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        p.aktif 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {p.aktif ? <FaToggleOn className="mr-1" /> : <FaToggleOff className="mr-1" />}
                                                    {p.aktif ? 'Aktif' : 'Pasif'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(p.iseGirisTarihi).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleOpenModal(p)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(p.personelID)} className="text-red-600 hover:text-red-900">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredList.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Personel bulunamadı.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && currentPersonnel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {currentPersonnel.personelID ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="adSoyad" className="block text-sm font-medium text-gray-700">Ad Soyad *</label>
                                <input
                                    type="text"
                                    name="adSoyad"
                                    id="adSoyad"
                                    value={currentPersonnel.adSoyad}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="pozisyon" className="block text-sm font-medium text-gray-700">Pozisyon *</label>
                                <select
                                    name="pozisyon"
                                    id="pozisyon"
                                    value={currentPersonnel.pozisyon}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="">Pozisyon Seçin</option>
                                    {getAvailablePositions().map((pos) => (
                                        <option key={pos} value={pos}>
                                            {pos}
                                            {positions?.occupiedSinglePositions.includes(pos) && !currentPersonnel.personelID && ' (Dolu)'}
                                        </option>
                                    ))}
                                </select>
                                {positions?.occupiedSinglePositions.includes(currentPersonnel.pozisyon || '') && !currentPersonnel.personelID && (
                                    <p className="mt-1 text-sm text-red-600">Bu pozisyon zaten dolu!</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">Telefon</label>
                                <input
                                    type="tel"
                                    name="telefon"
                                    id="telefon"
                                    value={currentPersonnel.telefon || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={currentPersonnel.email || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="maas" className="block text-sm font-medium text-gray-700">Maaş (₺)</label>
                                <input
                                    type="number"
                                    name="maas"
                                    id="maas"
                                    value={currentPersonnel.maas || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="aktif"
                                    id="aktif"
                                    checked={currentPersonnel.aktif}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="aktif" className="ml-2 block text-sm text-gray-900">Aktif</label>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700">Açıklama</label>
                            <textarea
                                name="aciklama"
                                id="aciklama"
                                rows={3}
                                value={currentPersonnel.aciklama || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                İptal
                            </button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Personnel; 