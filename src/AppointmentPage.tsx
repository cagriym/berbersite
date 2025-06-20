import React from 'react';

interface AppointmentPageProps {
  name: string;
  setName: (v: string) => void;
  surname: string;
  setSurname: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  selectedTime: string;
  setSelectedTime: (v: string) => void;
  selectedServiceId: number | null;
  setSelectedServiceId: (v: number) => void;
  services: any[];
  loading: boolean;
  enteredCode: string;
  setEnteredCode: (v: string) => void;
  isCodeSent: boolean;
  isPhoneVerified: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
  handleSendCode: () => void;
  handleVerifyCode: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  message: string;
  messageType: 'success' | 'error' | '';
}

const AppointmentPage: React.FC<AppointmentPageProps> = ({
  name, setName, surname, setSurname, phone, setPhone, selectedDate, setSelectedDate, selectedTime, setSelectedTime, selectedServiceId, setSelectedServiceId, services, loading, enteredCode, setEnteredCode, isCodeSent, isPhoneVerified, isSendingCode, isVerifyingCode, handleSendCode, handleVerifyCode, handleSubmit, message, messageType
}) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center pt-16 pb-8 relative">
    {/* Dekoratif ikonlar (daha az ve daha küçük) */}
    <div className="absolute left-4 top-16 animate-bounce text-amber-400 text-2xl opacity-40 select-none"><i className="fas fa-calendar-check"></i></div>
    <div className="absolute right-4 top-24 animate-pulse text-orange-400 text-2xl opacity-30 select-none"><i className="fas fa-user-clock"></i></div>
    <div className="w-full max-w-xl bg-white/95 p-6 rounded-xl shadow-xl border-2 border-amber-100 backdrop-blur-md z-10 animate-fade-in">
      <h2 className="text-2xl font-extrabold text-amber-900 mb-4 text-center drop-shadow">Randevu Formu</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1">Adınız</label>
          <input type="text" id="name" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm transition hover:border-amber-400" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız" required />
        </div>
        <div className="col-span-1">
          <label htmlFor="surname" className="block text-xs font-semibold text-gray-700 mb-1">Soyadınız</label>
          <input type="text" id="surname" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm transition hover:border-amber-400" value={surname} onChange={e => setSurname(e.target.value)} placeholder="Soyadınız" required />
        </div>
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1">Telefon</label>
            <input type="tel" id="phone" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm transition hover:border-amber-400" value={phone} onChange={e => setPhone(e.target.value)} placeholder="5XX XXX XX XX" pattern="[0-9]{10}" required disabled={isPhoneVerified || isSendingCode} />
          </div>
          <div className="flex items-end">
            {!isCodeSent && !isPhoneVerified && (
              <button type="button" onClick={handleSendCode} className={`px-3 py-2 rounded-lg shadow text-white font-medium text-xs transition ${phone.replace(/\D/g, '').length === 10 && !isSendingCode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`} disabled={phone.replace(/\D/g, '').length !== 10 || isSendingCode}>
                {isSendingCode ? <span>...</span> : 'Kod Gönder'}
              </button>
            )}
          </div>
        </div>
        {isCodeSent && !isPhoneVerified && (
          <div className="col-span-1 md:col-span-2 flex flex-row gap-2">
            <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm transition hover:border-amber-400" placeholder="Doğrulama kodu" value={enteredCode} onChange={e => setEnteredCode(e.target.value)} maxLength={6} required disabled={isVerifyingCode} />
            <button type="button" onClick={handleVerifyCode} className={`px-3 py-2 rounded-lg shadow text-white font-medium text-xs transition ${enteredCode.length === 6 && !isVerifyingCode ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`} disabled={enteredCode.length !== 6 || isVerifyingCode}>
              {isVerifyingCode ? <span>...</span> : 'Kodu Doğrula'}
            </button>
          </div>
        )}
        {isPhoneVerified && (
          <div className="col-span-1 md:col-span-2 text-green-600 text-xs font-medium flex items-center"><i className="fas fa-check-circle mr-2"></i> Telefon doğrulandı!</div>
        )}
        <div>
          <label htmlFor="date" className="block text-xs font-semibold text-gray-700 mb-1">Tarih</label>
          <input type="date" id="date" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm transition hover:border-amber-400" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
        </div>
        <div>
          <label htmlFor="time" className="block text-xs font-semibold text-gray-700 mb-1">Saat</label>
          <input type="time" id="time" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm transition hover:border-amber-400" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="service" className="block text-xs font-semibold text-gray-700 mb-1">Servis</label>
          {loading ? (
            <p className="text-gray-500 text-xs">Servisler yükleniyor...</p>
          ) : services.length === 0 ? (
            <p className="text-red-500 text-xs">Servisler şu anda hizmet vermiyor.</p>
          ) : (
            <select id="service" className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-lg shadow-sm transition hover:border-amber-400" value={selectedServiceId || ''} onChange={e => setSelectedServiceId(Number(e.target.value))} required>
              {services.map((service: any) => (
                <option key={service.servisID} value={service.servisID}>
                  {service.servisAdi} ({typeof service.varsayilanUcret === 'number' && !isNaN(service.varsayilanUcret) ? service.varsayilanUcret.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : 'Ücret Bilinmiyor'})
                </option>
              ))}
            </select>
          )}
        </div>
        {message && (
          <div className={`col-span-1 md:col-span-2 p-2 rounded-lg text-center text-xs font-medium ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition`}>{message}</div>
        )}
        <div className="col-span-1 md:col-span-2">
          <button type="submit" className={`w-full py-2 px-4 rounded-lg shadow-md text-base font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${loading || !isPhoneVerified ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading || !isPhoneVerified}>
            {loading ? <span>...</span> : 'Randevu Al'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default AppointmentPage; 