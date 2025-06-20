import React from 'react';

const services = [
  { icon: 'fa-scissors', title: 'Saç Kesimi', desc: 'Modern ve klasik saç kesimi, tarzınıza uygun profesyonel dokunuş.' },
  { icon: 'fa-beard', title: 'Sakal Tasarımı', desc: 'Yüz tipinize uygun sakal şekillendirme ve bakım.' },
  { icon: 'fa-brush', title: 'Saç Boyama', desc: 'Doğal ve modern renklerle saç boyama hizmeti.' },
  { icon: 'fa-spa', title: 'Cilt Bakımı', desc: 'Cildiniz için özel bakım ve rahatlatıcı uygulamalar.' },
  { icon: 'fa-user-tie', title: 'Damat Tıraşı', desc: 'Özel günleriniz için şık ve özenli damat tıraşı.' },
  { icon: 'fa-child', title: 'Çocuk Saç Kesimi', desc: 'Çocuklara özel sabırlı ve eğlenceli saç kesimi.' },
];

const Services = () => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-amber-50 to-orange-100 pt-24 pb-12">
    <div className="max-w-5xl w-full mx-auto">
      <h2 className="text-3xl font-extrabold text-amber-900 mb-8 text-center">Hizmetlerimiz</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <div key={i} className="bg-white/90 rounded-xl shadow-xl p-8 flex flex-col items-center border border-amber-200 hover:scale-105 transition">
            <i className={`fas ${s.icon} text-4xl text-amber-600 mb-4`}></i>
            <h3 className="text-xl font-bold text-amber-800 mb-2">{s.title}</h3>
            <p className="text-base text-amber-700 text-center">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Services; 