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
      <h2 className="text-2xl font-bold mb-4">İletişim Mesajları</h2>
      {loading && <div>Yükleniyor...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Ad</th>
                <th className="px-4 py-2 border-b">E-posta</th>
                <th className="px-4 py-2 border-b">Mesaj</th>
                <th className="px-4 py-2 border-b">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id}>
                  <td className="px-4 py-2 border-b font-semibold">{msg.name}</td>
                  <td className="px-4 py-2 border-b">{msg.email}</td>
                  <td className="px-4 py-2 border-b">{msg.message}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-500">{new Date(msg.createdAt).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr><td colSpan={4} className="text-center py-4 text-gray-500">Hiç mesaj yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactMessages; 