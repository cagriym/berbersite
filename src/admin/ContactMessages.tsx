import React, { useEffect, useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log("ContactMessages componenti render edildi!");

  useEffect(() => {
    console.log("apiUrl:", apiUrl);
    if (!apiUrl) {
      console.error("UYARI: apiUrl undefined veya boş! .env dosyasını ve uygulamanın yeniden başlatıldığını kontrol et.");
    }
    const fetchUrl = `${apiUrl}/contactmessages`;
    console.log("fetch başlıyor:", fetchUrl);
    fetch(fetchUrl)
      .then(res => {
        console.log("API response status:", res.status);
        if (!res.ok) throw new Error('API hatası');
        return res.json();
      })
      .then(data => {
        console.log("Gelen veri:", data);
        setMessages(data);
      })
      .catch((err) => {
        setError('Mesajlar yüklenemedi.');
        console.error("Hata:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">İletişim Mesajları</h2>
      {loading && <div className="text-gray-700">Yükleniyor...</div>}
      {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-900">Ad</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-900">E-posta</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-900">Mesaj</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-900">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900">{msg.name}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-gray-700">{msg.email}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-gray-700 max-w-xs truncate">{msg.message}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-600">{new Date(msg.createdAt).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500 bg-gray-50">
                    Henüz hiç mesaj yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactMessages; 