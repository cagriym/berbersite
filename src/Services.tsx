import React from 'react';

// Service arayüzünü App.tsx'ten buraya taşıyabilir veya import edebiliriz.
// Şimdilik burada tanımlayalım.
interface Service {
    servisID: number;
    servisAdi: string;
    varsayilanUcret?: number | null;
}

// Statik service listesi kaldırıldı, artık proplardan gelecek.
// const services = [ ... ];

const Services = ({ services }: { services: Service[] }) => (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-24 pb-12">
        <div className="max-w-5xl w-full mx-auto">
            <h2 className="text-3xl font-extrabold text-dark-100 mb-8 text-center">Hizmetlerimiz</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((s, i) => (
                    <div key={s.servisID} className="bg-dark-800/80 backdrop-blur-md rounded-xl shadow-2xl p-8 flex flex-col items-center border border-dark-600 hover:scale-105 transition-all duration-300 hover:shadow-accent-500/20 hover:border-accent-500/50 group">
                        <i className={`fas fa-cut text-4xl text-accent-400 mb-4 group-hover:text-accent-300 transition-colors duration-300`}></i>
                        <h3 className="text-xl font-bold text-dark-100 mb-2 group-hover:text-accent-300 transition-colors duration-300">{s.servisAdi}</h3>
                        {/* API'den açıklama gelmiyorsa, bu kısmı kaldırabilir veya genel bir metin ekleyebiliriz. */}
                        <p className="text-base text-dark-300 text-center group-hover:text-dark-200 transition-colors duration-300">
                            {s.varsayilanUcret ? `${s.varsayilanUcret} TL'den başlayan fiyatlarla` : 'Profesyonel hizmet'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default Services; 