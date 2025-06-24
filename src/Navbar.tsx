import React from 'react';

const Navbar = ({ activeSection, scrollToSection, setShowAppointment }: {
  activeSection: string;
  scrollToSection: (section: string) => void;
  setShowAppointment: (show: boolean) => void;
}) => (
  <nav className="fixed top-0 left-0 w-full bg-[#1a2236]/95 backdrop-blur-md z-50 shadow-lg border-b border-gray-800">
    <div className="max-w-6xl mx-auto px-4 sm:px-8 flex justify-between items-center h-16">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}> 
        <img src="/logo192.png" alt="Oktay Saç Tasarım" className="h-10 w-10 rounded-full shadow-lg border-2 border-accent-500" />
        <span className="font-extrabold text-xl text-accent-400 tracking-tight">Oktay Gün Saç Tasarım</span>
      </div>
      <div className="hidden md:flex gap-6 font-semibold text-white text-base">
        <button className={`transition-colors duration-200 ${activeSection==='home' ? 'text-accent-400 underline decoration-accent-400' : 'hover:text-accent-300'}`} onClick={() => scrollToSection('home')}>Ana Sayfa</button>
        <button className={`transition-colors duration-200 ${activeSection==='about' ? 'text-accent-400 underline decoration-accent-400' : 'hover:text-accent-300'}`} onClick={() => scrollToSection('about')}>Hakkımızda</button>
        <button className={`transition-colors duration-200 ${activeSection==='services' ? 'text-accent-400 underline decoration-accent-400' : 'hover:text-accent-300'}`} onClick={() => scrollToSection('services')}>Hizmetler</button>
        <button className={`transition-colors duration-200 ${activeSection==='contact' ? 'text-accent-400 underline decoration-accent-400' : 'hover:text-accent-300'}`} onClick={() => scrollToSection('contact')}>İletişim</button>
      </div>
      {/* Mobil menü için hamburger ikonunu burada ekleyebilirsiniz */}
    </div>
  </nav>
);

export default Navbar; 