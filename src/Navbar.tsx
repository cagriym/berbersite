import React from 'react';

const Navbar = ({ activeSection, scrollToSection, setShowAppointment }: {
  activeSection: string;
  scrollToSection: (section: string) => void;
  setShowAppointment: (show: boolean) => void;
}) => (
  <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur z-50 shadow-md border-b border-amber-200">
    <div className="max-w-6xl mx-auto px-4 sm:px-8 flex justify-between items-center h-16">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}> 
        <img src="/logo192.png" alt="Oktay Saç Tasarım" className="h-10 w-10 rounded-full shadow" />
        <span className="font-extrabold text-xl text-amber-700 tracking-tight">Oktay Gün Saç Tasarım</span>
      </div>
      <div className="hidden md:flex gap-6 font-semibold text-amber-900 text-base">
        <button className={activeSection==='home' ? 'text-amber-600 underline' : ''} onClick={() => scrollToSection('home')}>Ana Sayfa</button>
        <button className={activeSection==='about' ? 'text-amber-600 underline' : ''} onClick={() => scrollToSection('about')}>Hakkımızda</button>
        <button className={activeSection==='services' ? 'text-amber-600 underline' : ''} onClick={() => scrollToSection('services')}>Hizmetler</button>
        <button className={activeSection==='contact' ? 'text-amber-600 underline' : ''} onClick={() => scrollToSection('contact')}>İletişim</button>
        <button className="bg-amber-600 text-white px-3 py-1 rounded shadow" onClick={() => setShowAppointment(true)}>Randevu Al</button>
      </div>
      {/* Mobil menü için hamburger ikonunu burada ekleyebilirsiniz */}
    </div>
  </nav>
);

export default Navbar; 