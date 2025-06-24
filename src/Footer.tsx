import React from 'react';

const Footer = () => (
  <footer className="w-full bg-white border-t border-gray-200 py-6 mt-16">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <img src="/logo192.png" alt="Oktay Saç Tasarım" className="h-8 w-8 rounded-full border border-accent-500" />
        <span className="font-bold text-black">Oktay Gün Saç Tasarım</span>
      </div>
      <div className="flex gap-6 text-gray-700 text-sm items-center">
        <a href="https://www.instagram.com/oktaygunsactasarim/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 flex items-center transition-colors duration-200"><i className="fab fa-instagram mr-1"></i> Instagram</a>
        <a href="https://wa.me/905308965315" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center transition-colors duration-200"><i className="fab fa-whatsapp mr-1"></i> WhatsApp</a>
        <span className="flex items-center"><i className="fas fa-map-marker-alt mr-1 text-accent-400"></i> Cumhuriyet, 20. Sk., 55200 Atakum/Samsun</span>
        <span className="flex items-center"><i className="fas fa-phone-alt mr-1 text-accent-400"></i> 0530 896 53 15</span>
      </div>
      <div className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Oktay Gün Saç Tasarım. Tüm Hakları Saklıdır.</div>
    </div>
  </footer>
);

export default Footer; 