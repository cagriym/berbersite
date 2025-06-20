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
  selectedServiceIds: number[];
  setSelectedServiceIds: (ids: number[]) => void;
  services: any[];
  totalPrice: number;
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
  closeModal: () => void;
}

const AppointmentPage: React.FC<AppointmentPageProps> = ({
  name, setName, surname, setSurname, phone, setPhone, selectedDate, setSelectedDate, selectedTime, setSelectedTime, selectedServiceIds, setSelectedServiceIds, services, totalPrice, loading, enteredCode, setEnteredCode, isCodeSent, isPhoneVerified, isSendingCode, isVerifyingCode, handleSendCode, handleVerifyCode, handleSubmit, message, messageType, closeModal
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
    <div className="w-full h-full max-w-none max-h-none sm:max-w-xl sm:max-h-[90vh] bg-white/95 p-0 sm:p-6 rounded-none sm:rounded-xl shadow-xl border-0 sm:border-2 sm:border-amber-100 relative flex items-center justify-center overflow-y-auto">
      <div className="w-full p-4 sm:p-0 sm:w-auto">
        <button onClick={closeModal} className="absolute top-4 right-4 text-3xl text-gray-500 hover:text-red-600 transition z-10">&times;</button>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">Servis(ler)</label>
            {loading ? (
              <p className="text-gray-500 text-xs">Servisler yükleniyor...</p>
            ) : services.length === 0 ? (
              <p className="text-red-500 text-xs">Servisler şu anda hizmet vermiyor.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {services.map((service: any) => (
                    <label key={service.servisID} className="flex items-center gap-2 text-sm font-medium bg-amber-50 px-2 py-1 rounded shadow-sm border border-amber-200 cursor-pointer hover:bg-amber-100 transition">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.servisID)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedServiceIds([...selectedServiceIds, service.servisID]);
                          } else {
                            setSelectedServiceIds(selectedServiceIds.filter(id => id !== service.servisID));
                          }
                        }}
                        className="accent-amber-600"
                      />
                      {service.servisAdi} ({typeof service.varsayilanUcret === 'number' && !isNaN(service.varsayilanUcret) ? service.varsayilanUcret.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : 'Ücret Bilinmiyor'})
                    </label>
                  ))}
                </div>
                {selectedServiceIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedServiceIds([])}
                    className="text-xs text-red-600 hover:text-red-800 font-medium underline transition"
                  >
                    Seçili Servisleri Temizle
                  </button>
                )}
              </>
            )}
          </div>
          <div className="col-span-1 md:col-span-2 text-right text-base font-bold text-amber-700">
            Toplam: {totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
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
  </div>
);

export default AppointmentPage; 