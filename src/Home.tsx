import React from 'react';

const Home = ({ scrollToSection, setShowAppointment }: {
  scrollToSection: (section: string) => void;
  setShowAppointment: (show: boolean) => void;
}) => (
  <div className="min-h-screen flex flex-col justify-center items-center pt-28 pb-16 relative">
    {/* Hareketli dekoratif ikonlar */}
    <div className="absolute left-8 top-24 animate-bounce text-amber-400 text-5xl opacity-60 select-none"><i className="fas fa-scissors"></i></div>
    <div className="absolute right-8 top-40 animate-pulse text-orange-400 text-4xl opacity-50 select-none"><i className="fas fa-brush"></i></div>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-24 animate-spin-slow text-amber-300 text-6xl opacity-30 select-none"><i className="fas fa-beard"></i></div>
    <div className="max-w-3xl w-full text-center z-10">
      <img src="/logo192.png" alt="Oktay Gün Saç Tasarım" className="mx-auto mb-6 rounded-full shadow-2xl border-4 border-amber-300 w-32 h-32 object-cover animate-fade-in" />
      <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-900 mb-4 drop-shadow animate-fade-in">Oktay Gün Saç Tasarım'a <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Hoşgeldiniz</span></h1>
      <div className="bg-white/80 rounded-xl shadow-lg p-6 mb-8 animate-fade-in">
        <p className="text-lg sm:text-xl text-amber-800 font-medium">Samsun Atakum'da modern, yenilikçi ve profesyonel berber hizmetleri. Kendinizi özel hissetmek için doğru adrestesiniz!</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in">
        <button onClick={() => scrollToSection('services')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition">Hizmetlerimiz</button>
        <button onClick={() => setShowAppointment(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition">Randevu Al</button>
      </div>
      <div className="mt-8 text-amber-900 text-base animate-fade-in">
        <i className="fas fa-map-marker-alt mr-2"></i> Cumhuriyet, 20. Sk., 55200 Atakum/Samsun
        <span className="mx-4">|</span>
        <i className="fas fa-phone-alt mr-2"></i> 0530 896 53 15
      </div>
    </div>
  </div>
);

export default Home; 