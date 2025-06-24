import React, { useState, useEffect } from 'react';

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
  getUnavailableTimes?: (date: string) => Promise<string[]>;
}

const AppointmentPage: React.FC<AppointmentPageProps> = ({
  name, setName, surname, setSurname, phone, setPhone, selectedDate, setSelectedDate, selectedTime, setSelectedTime, selectedServiceIds, setSelectedServiceIds, services, totalPrice, loading, enteredCode, setEnteredCode, isCodeSent, isPhoneVerified, isSendingCode, isVerifyingCode, handleSendCode, handleVerifyCode, handleSubmit, message, messageType, closeModal, getUnavailableTimes
}) => {
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
  const [availableTimes] = useState(() => {
    const times = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  });

  useEffect(() => {
    if (getUnavailableTimes && selectedDate) {
      getUnavailableTimes(selectedDate).then(setUnavailableTimes);
    }
  }, [selectedDate, getUnavailableTimes]);

  const isTimeAvailable = (time: string) => {
    return !unavailableTimes.includes(time);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full h-full max-w-none max-h-none sm:max-w-xl sm:max-h-[90vh] bg-dark-800/95 p-0 sm:p-6 rounded-none sm:rounded-xl shadow-2xl border-0 sm:border-2 sm:border-dark-600 relative flex items-center justify-center overflow-y-auto">
        <div className="w-full p-4 sm:p-0 sm:w-auto">
          <button onClick={closeModal} className="absolute top-4 right-4 text-3xl text-dark-400 hover:text-red-400 transition z-10">&times;</button>
          <h2 className="text-2xl font-extrabold text-dark-100 mb-4 text-center drop-shadow">Randevu Formu</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label htmlFor="name" className="block text-xs font-semibold text-dark-300 mb-1">Adınız</label>
              <input type="text" id="name" className="block w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm text-dark-100 placeholder-dark-400 transition hover:border-accent-400" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız" required />
            </div>
            <div className="col-span-1">
              <label htmlFor="surname" className="block text-xs font-semibold text-dark-300 mb-1">Soyadınız</label>
              <input type="text" id="surname" className="block w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm text-dark-100 placeholder-dark-400 transition hover:border-accent-400" value={surname} onChange={e => setSurname(e.target.value)} placeholder="Soyadınız" required />
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <label htmlFor="phone" className="block text-xs font-semibold text-dark-300 mb-1">Telefon</label>
                <input type="tel" id="phone" className="block w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm text-dark-100 placeholder-dark-400 transition hover:border-accent-400" value={phone} onChange={e => setPhone(e.target.value)} placeholder="5XX XXX XX XX" pattern="[0-9]{10}" required disabled={isPhoneVerified || isSendingCode} />
              </div>
              <div className="flex items-end">
                {!isCodeSent && !isPhoneVerified && (
                  <button type="button" onClick={handleSendCode} className={`px-3 py-2 rounded-lg shadow text-white font-medium text-xs transition ${phone.replace(/\D/g, '').length === 10 && !isSendingCode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-dark-600 cursor-not-allowed'}`} disabled={phone.replace(/\D/g, '').length !== 10 || isSendingCode}>
                    {isSendingCode ? <span>...</span> : 'Kod Gönder'}
                  </button>
                )}
              </div>
            </div>
            {isCodeSent && !isPhoneVerified && (
              <div className="col-span-1 md:col-span-2 flex flex-row gap-2">
                <input type="text" className="flex-1 px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm text-dark-100 placeholder-dark-400 transition hover:border-accent-400" placeholder="Doğrulama kodu" value={enteredCode} onChange={e => setEnteredCode(e.target.value)} maxLength={6} required disabled={isVerifyingCode} />
                <button type="button" onClick={handleVerifyCode} className={`px-3 py-2 rounded-lg shadow text-white font-medium text-xs transition ${enteredCode.length === 6 && !isVerifyingCode ? 'bg-green-600 hover:bg-green-700' : 'bg-dark-600 cursor-not-allowed'}`} disabled={enteredCode.length !== 6 || isVerifyingCode}>
                  {isVerifyingCode ? <span>...</span> : 'Kodu Doğrula'}
                </button>
              </div>
            )}
            {isPhoneVerified && (
              <div className="col-span-1 md:col-span-2 text-green-400 text-xs font-medium flex items-center"><i className="fas fa-check-circle mr-2"></i> Telefon doğrulandı!</div>
            )}
            <div>
              <label htmlFor="date" className="block text-xs font-semibold text-dark-300 mb-1">Tarih</label>
              <input type="date" id="date" className="block w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm text-dark-100 transition hover:border-accent-400" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label htmlFor="time" className="block text-xs font-semibold text-dark-300 mb-1">Saat</label>
              <select 
                id="time" 
                className="block w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm text-dark-100 transition hover:border-accent-400" 
                value={selectedTime} 
                onChange={e => setSelectedTime(e.target.value)} 
                required
              >
                <option value="">Saat Seçin</option>
                {availableTimes.map(time => (
                  <option 
                    key={time} 
                    value={time}
                    disabled={!isTimeAvailable(time)}
                    className={!isTimeAvailable(time) ? 'text-dark-500' : 'text-dark-100'}
                  >
                    {time} {!isTimeAvailable(time) ? '(Müsait Değil)' : ''}
                  </option>
                ))}
              </select>
              {unavailableTimes.length > 0 && (
                <p className="text-xs text-dark-400 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Kırmızı işaretli saatler müsait değildir
                </p>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-dark-300 mb-1">Servis(ler)</label>
              {loading ? (
                <p className="text-dark-400 text-xs">Servisler yükleniyor...</p>
              ) : services.length === 0 ? (
                <p className="text-red-400 text-xs">Servisler şu anda hizmet vermiyor.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {services.map((service: any) => (
                      <label key={service.servisID} className="flex items-center gap-2 text-sm font-medium bg-dark-700 px-2 py-1 rounded shadow-sm border border-dark-600 cursor-pointer hover:bg-dark-600 transition text-dark-200">
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
                          className="accent-accent-500"
                        />
                        {service.servisAdi} ({typeof service.varsayilanUcret === 'number' && !isNaN(service.varsayilanUcret) ? service.varsayilanUcret.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : 'Ücret Bilinmiyor'})
                      </label>
                    ))}
                  </div>
                  {selectedServiceIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedServiceIds([])}
                      className="text-xs text-red-400 hover:text-red-300 font-medium underline transition"
                    >
                      Seçili Servisleri Temizle
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="col-span-1 md:col-span-2 text-right text-base font-bold text-accent-400">
              Toplam: {totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </div>
            {message && (
              <div className={`col-span-1 md:col-span-2 p-4 rounded-lg text-center font-medium transition-all duration-500 ${
                messageType === 'success' 
                  ? 'bg-green-900/20 border-2 border-green-500/30 text-green-300 shadow-lg' 
                  : 'bg-red-900/20 border-2 border-red-500/30 text-red-300 shadow-lg'
              }`}>
                <div className="flex items-center justify-center mb-2">
                  {messageType === 'success' ? (
                    <i className="fas fa-check-circle text-2xl text-green-400 mr-2"></i>
                  ) : (
                    <i className="fas fa-exclamation-circle text-2xl text-red-400 mr-2"></i>
                  )}
                  <span className="text-lg font-bold">
                    {messageType === 'success' ? 'Başarılı!' : 'Hata!'}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-line leading-relaxed">
                  {message}
                </div>
                {messageType === 'success' && (
                  <div className="mt-3 text-xs text-green-400">
                    <i className="fas fa-clock mr-1"></i>
                    Bu mesaj 5 saniye sonra otomatik olarak kapanacak...
                  </div>
                )}
              </div>
            )}
            <div className="col-span-1 md:col-span-2">
              <button type="submit" className={`w-full py-2 px-4 rounded-lg shadow-md text-base font-bold text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 transition ${loading || !isPhoneVerified ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading || !isPhoneVerified}>
                {loading ? 'Gönderiliyor...' : 'Randevu Al'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage; 