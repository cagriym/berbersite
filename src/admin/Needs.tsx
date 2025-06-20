import React, { useEffect, useState } from 'react';

interface Need {
  ihtiyacID: number;
  ad: string;
  miktar: number;
  birimFiyat: number;
  toplamFiyat: number;
  createdAt: string;
  musteriID: number;
  musteri: { ad: string; soyad: string; telefon: string };
}

const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net/api';

function getHeaders(contentType = false) {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const Needs: React.FC = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<Need>>({ miktar: 1, birimFiyat: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Fetch all needs
  const fetchNeeds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/Needs`, { headers: getHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNeeds(data);
    } catch (err: any) {
      setError(err.message || 'İhtiyaçlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, []);

  // Add or update need
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(editingId ?? 0);
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/Needs/${editingId}` : `${API_BASE_URL}/Needs`;
      const body = { ...form, toplamFiyat: (form.miktar || 0) * (form.birimFiyat || 0) };
      const res = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setForm({ miktar: 1, birimFiyat: 0 });
      setEditingId(null);
      await fetchNeeds();
    } catch (err: any) {
      setError(err.message || 'İhtiyaç kaydedilemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  // Edit need
  const handleEdit = (need: Need) => {
    setForm({
      ihtiyacID: need.ihtiyacID,
      ad: need.ad,
      miktar: need.miktar,
      birimFiyat: need.birimFiyat,
      toplamFiyat: need.toplamFiyat,
      musteriID: need.musteriID,
    });
    setEditingId(need.ihtiyacID);
  };

  // Delete need
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu ihtiyacı silmek istediğinize emin misiniz?')) return;
    setActionLoading(id);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/Needs/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      setNeeds((prev) => prev.filter((n) => n.ihtiyacID !== id));
    } catch (err: any) {
      setError(err.message || 'İhtiyaç silinemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredNeeds = needs.filter(n =>
    n.ad.toLowerCase().includes(search.toLowerCase()) ||
    (n.musteri && (n.musteri.ad.toLowerCase().includes(search.toLowerCase()) || n.musteri.soyad.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">İhtiyaçlar</h2>
      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex flex-wrap gap-2 mb-4 items-end">
          <input type="text" placeholder="İhtiyaç veya müşteri adı" className="border p-2 rounded" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2 items-end">
          <input type="text" placeholder="Ad" className="border p-2 rounded" value={form.ad || ''} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} required />
          <input type="number" placeholder="Miktar" className="border p-2 rounded w-24" value={form.miktar || 1} min={1} onChange={e => setForm(f => ({ ...f, miktar: Number(e.target.value) }))} required />
          <input type="number" placeholder="Birim Fiyat" className="border p-2 rounded w-32" value={form.birimFiyat || 0} min={0} step={0.01} onChange={e => setForm(f => ({ ...f, birimFiyat: Number(e.target.value) }))} required />
          <input type="number" placeholder="Müşteri ID" className="border p-2 rounded w-24" value={form.musteriID || ''} min={1} onChange={e => setForm(f => ({ ...f, musteriID: Number(e.target.value) }))} required />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" disabled={actionLoading !== null}>{editingId ? 'Güncelle' : 'Ekle'}</button>
          {editingId && <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => { setForm({ miktar: 1, birimFiyat: 0 }); setEditingId(null); }}>Vazgeç</button>}
        </form>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : filteredNeeds.length === 0 ? (
          <div>Hiç ihtiyaç bulunamadı.</div>
        ) : (
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-amber-100">
                <th className="p-2 border">Ad</th>
                <th className="p-2 border">Miktar</th>
                <th className="p-2 border">Birim Fiyat</th>
                <th className="p-2 border">Toplam</th>
                <th className="p-2 border">Müşteri</th>
                <th className="p-2 border">Tarih</th>
                <th className="p-2 border">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredNeeds.map((n) => (
                <tr key={n.ihtiyacID}>
                  <td className="p-2 border">{n.ad}</td>
                  <td className="p-2 border">{n.miktar}</td>
                  <td className="p-2 border">₺{n.birimFiyat?.toLocaleString('tr-TR')}</td>
                  <td className="p-2 border">₺{n.toplamFiyat?.toLocaleString('tr-TR')}</td>
                  <td className="p-2 border">{n.musteri ? `${n.musteri.ad} ${n.musteri.soyad}` : n.musteriID}</td>
                  <td className="p-2 border">{n.createdAt ? n.createdAt.slice(0, 10) : '-'}</td>
                  <td className="p-2 border space-x-2">
                    <button className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white hover:bg-yellow-600 transition" onClick={() => handleEdit(n)} disabled={actionLoading === n.ihtiyacID}>Düzenle</button>
                    <button className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition" onClick={() => handleDelete(n.ihtiyacID)} disabled={actionLoading === n.ihtiyacID}>{actionLoading === n.ihtiyacID ? '...' : 'Sil'}</button>
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

export default Needs; 