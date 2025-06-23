import React, { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${apiUrl}/contactmessages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (response.ok) {
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
        setTimeout(() => setSent(false), 4000);
      } else {
        setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Sunucuya ulaşılamıyor.');
    }
  };
  return (
    <div className="min-h-[40vh] flex flex-col justify-center items-center bg-gradient-to-br from-amber-50 to-orange-100 pt-12 pb-8">
      <div className="max-w-3xl w-full bg-white/90 rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-amber-900 mb-4 text-center">İletişim</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-800 mb-2">Adres</h3>
            <p className="text-base text-amber-700 mb-2 font-semibold">Oktay Saç Tasarım</p>
            <p className="text-base text-amber-700 mb-2">Cumhuriyet, 20. Sk., 55200 Atakum/Samsun</p>
            <h3 className="text-lg font-bold text-amber-800 mb-2">Telefon</h3>
            <p className="text-base text-amber-700 mb-2">0530 896 53 15</p>
            <h3 className="text-lg font-bold text-amber-800 mb-2">Instagram</h3>
            <a href="https://www.instagram.com/oktaygunsactasarim/" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">@oktaygunsactasarim</a>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-800 mb-2">Bize Ulaşın</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input type="text" placeholder="Adınız" className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-amber-500" required value={name} onChange={e => setName(e.target.value)} />
              <input type="email" placeholder="E-posta" className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-amber-500" required value={email} onChange={e => setEmail(e.target.value)} />
              <textarea placeholder="Mesajınız" className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-amber-500" rows={4} required value={message} onChange={e => setMessage(e.target.value)}></textarea>
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg shadow transition">Gönder</button>
              {sent && <div className="text-green-700 bg-green-100 rounded-lg p-2 mt-2 text-center font-semibold">Mesajınız başarıyla gönderildi!</div>}
              {error && <div className="text-red-700 bg-red-100 rounded-lg p-2 mt-2 text-center font-semibold">{error}</div>}
            </form>
          </div>
        </div>
        <div className="mt-8 rounded-xl overflow-hidden shadow-lg border border-amber-200">
          <iframe title="Oktay Saç Tasarım Konumu" src="https://www.google.com/maps?q=Oktay+Saç+Tasarım,+Cumhuriyet,+20.+Sk.,+55200+Atakum%2FSamsun&output=embed" width="100%" height="220" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact; 