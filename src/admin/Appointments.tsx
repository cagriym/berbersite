import React, { useEffect, useState } from 'react';

// Appointment type matching backend DTO
interface Appointment {
  randevuID: number;
  musteriID: number;
  servisID: number;
  musteriAdi: string;
  musteriSoyad: string;
  musteriTelefon: string;
  randevuZamani: string;
  servis: string;
  ucret: number;
  aciklama: string;
  tamamlandimi: boolean;
  createdAt: string;
}

const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net/api';

function getHeaders(contentType = false) {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'completed'>('all');

  // Fetch all appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/Appointments`, { headers: getHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Randevular yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Approve/complete appointment
  const handleApprove = async (id: number, tamamlandimi: boolean) => {
    setActionLoading(id);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/Appointments/complete`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ RandevuID: id, Tamamlandimi: tamamlandimi }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAppointments();
    } catch (err: any) {
      setError(err.message || 'Durum güncellenemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete appointment
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return;
    setActionLoading(id);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/Appointments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      setAppointments((prev) => prev.filter((a) => a.randevuID !== id));
    } catch (err: any) {
      setError(err.message || 'Randevu silinemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch =
      a.musteriAdi.toLowerCase().includes(search.toLowerCase()) ||
      a.musteriSoyad.toLowerCase().includes(search.toLowerCase()) ||
      a.musteriTelefon.includes(search);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'waiting' && !a.tamamlandimi) ||
      (statusFilter === 'completed' && a.tamamlandimi);
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Randevular</h2>
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <input type="text" placeholder="Müşteri adı, soyadı veya telefon" className="border p-2 rounded" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border p-2 rounded" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="all">Tümü</option>
          <option value="waiting">Bekleyen</option>
          <option value="completed">Tamamlandı</option>
        </select>
      </div>
      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Yükleniyor...</div>
        ) : filteredAppointments.length === 0 ? (
          <div>Hiç randevu bulunamadı.</div>
        ) : (
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-amber-100">
                <th className="p-2 border">Tarih</th>
                <th className="p-2 border">Saat</th>
                <th className="p-2 border">Müşteri</th>
                <th className="p-2 border">Telefon</th>
                <th className="p-2 border">Servis</th>
                <th className="p-2 border">Ücret</th>
                <th className="p-2 border">Açıklama</th>
                <th className="p-2 border">Durum</th>
                <th className="p-2 border">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => (
                <tr key={a.randevuID} className={a.tamamlandimi ? 'bg-green-50' : ''}>
                  <td className="p-2 border">{a.randevuZamani.slice(0, 10)}</td>
                  <td className="p-2 border">{a.randevuZamani.slice(11, 16)}</td>
                  <td className="p-2 border">{a.musteriAdi} {a.musteriSoyad}</td>
                  <td className="p-2 border">{a.musteriTelefon}</td>
                  <td className="p-2 border">{a.servis}</td>
                  <td className="p-2 border">₺{a.ucret?.toLocaleString('tr-TR')}</td>
                  <td className="p-2 border">{a.aciklama}</td>
                  <td className="p-2 border font-semibold">
                    {a.tamamlandimi ? (
                      <span className="text-green-600">Tamamlandı</span>
                    ) : (
                      <span className="text-yellow-600">Bekliyor</span>
                    )}
                  </td>
                  <td className="p-2 border space-x-2">
                    <button
                      className={`px-2 py-1 rounded text-xs font-bold ${a.tamamlandimi ? 'bg-gray-300 text-gray-600' : 'bg-green-500 text-white hover:bg-green-600'} transition`}
                      disabled={a.tamamlandimi || actionLoading === a.randevuID}
                      onClick={() => handleApprove(a.randevuID, true)}
                    >
                      {actionLoading === a.randevuID ? '...' : 'Onayla'}
                    </button>
                    <button
                      className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition"
                      disabled={actionLoading === a.randevuID}
                      onClick={() => handleDelete(a.randevuID)}
                    >
                      {actionLoading === a.randevuID ? '...' : 'Sil'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Appointments; 