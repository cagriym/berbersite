import React, { useEffect, useState } from 'react';

interface Customer {
  musteriID: number;
  ad: string;
  soyad: string;
  telefon: string;
  sonGelisTarihi: string;
}

const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net/api';

function getHeaders(contentType = false) {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<Customer>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Fetch all customers
  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/Musteriler`, { headers: getHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Müşteriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Add or update customer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(editingId ?? 0);
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/Musteriler/${editingId}` : `${API_BASE_URL}/Musteriler`;
      const res = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setForm({});
      setEditingId(null);
      await fetchCustomers();
    } catch (err: any) {
      setError(err.message || 'Müşteri kaydedilemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  // Edit customer
  const handleEdit = (customer: Customer) => {
    setForm(customer);
    setEditingId(customer.musteriID);
  };

  // Delete customer
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;
    setActionLoading(id);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/Musteriler/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      setCustomers((prev) => prev.filter((c) => c.musteriID !== id));
    } catch (err: any) {
      setError(err.message || 'Müşteri silinemedi.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.ad.toLowerCase().includes(search.toLowerCase()) ||
    c.soyad.toLowerCase().includes(search.toLowerCase()) ||
    c.telefon.includes(search)
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Müşteriler</h2>
      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex flex-wrap gap-2 mb-4 items-end">
          <input type="text" placeholder="Ad, soyad veya telefon" className="border p-2 rounded" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2 items-end">
          <input type="text" placeholder="Ad" className="border p-2 rounded" value={form.ad || ''} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} required />
          <input type="text" placeholder="Soyad" className="border p-2 rounded" value={form.soyad || ''} onChange={e => setForm(f => ({ ...f, soyad: e.target.value }))} required />
          <input type="text" placeholder="Telefon" className="border p-2 rounded" value={form.telefon || ''} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} required />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" disabled={actionLoading !== null}>{editingId ? 'Güncelle' : 'Ekle'}</button>
          {editingId && <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => { setForm({}); setEditingId(null); }}>Vazgeç</button>}
        </form>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : filteredCustomers.length === 0 ? (
          <div>Hiç müşteri bulunamadı.</div>
        ) : (
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-amber-100">
                <th className="p-2 border">Ad</th>
                <th className="p-2 border">Soyad</th>
                <th className="p-2 border">Telefon</th>
                <th className="p-2 border">Son Geliş</th>
                <th className="p-2 border">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.musteriID}>
                  <td className="p-2 border">{c.ad}</td>
                  <td className="p-2 border">{c.soyad}</td>
                  <td className="p-2 border">{c.telefon}</td>
                  <td className="p-2 border">{c.sonGelisTarihi ? c.sonGelisTarihi.slice(0, 10) : '-'}</td>
                  <td className="p-2 border space-x-2">
                    <button className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white hover:bg-yellow-600 transition" onClick={() => handleEdit(c)} disabled={actionLoading === c.musteriID}>Düzenle</button>
                    <button className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition" onClick={() => handleDelete(c.musteriID)} disabled={actionLoading === c.musteriID}>{actionLoading === c.musteriID ? '...' : 'Sil'}</button>
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

export default Customers; 