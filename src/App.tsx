import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import About from './About';
import Services from './Services';
// import Gallery from './Gallery'; // Galeri kaldırıldı
import Contact from './Contact';
import AppointmentPage from './AppointmentPage';

// API'nızın çalıştığı temel URL
// ÖNEMLİ: Kendi Azure App Service URL'nizi buraya yazın.
const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net/api'; // Kendi API URL'nizle DEĞİŞTİRİN!

// Servis verilerini temsil eden arayüz (API'den gelen veriye göre camelCase)
interface Service {
  servisID: number;
  servisAdi: string;
  varsayilanUcret: number | null | undefined;
}

// Randevu verilerini temsil eden arayüz (API'den gelen veriye göre camelCase)
interface Appointment {
  randevuID: number;
  musteriID: number;
  servisID: number;
  musteriAdi: string;
  musteriSoyad: string;
  musteriTelefon: string;
  randevuZamani: string; // ISO string formatında
  servis: string; // API'den join ile gelen servis adı
  ucret: number | null | undefined; // camelCase
  aciklama: string;
  tamamlandimi: boolean;
  createdAt: string; // API'den gelen yaratılma tarihi
}

// İhtiyaç (Gider) verilerini temsil eden arayüz (API'den gelen veriye göre camelCase)
interface Need {
  ihtiyacID: number;
  ad: string;
  miktar: number;
  birimFiyat: number | null | undefined;
  toplamFiyat: number | null | undefined;
  createdAt: string; // API'den gelen yaratılma tarihi
}

const backgroundImages = [
  '/oktayberber1.png',
  '/oktayberber2.png',
  '/oktayberber3.png',
  '/oktayberber4.png',
];

const sliderImages = [
  '/oktayberber3.png',
  '/oktayberber2.png',
  '/oktayberber1.png',
  '/oktayberber4.png',
];

function PhotoSlider() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [index]);

  const prev = () => setIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  const next = () => setIndex((prev) => (prev + 1) % sliderImages.length);

  return (
    <div className="relative w-full flex justify-center items-center min-h-[260px] md:min-h-[400px] lg:min-h-[500px] py-4">
      <div className="absolute inset-0 flex items-center justify-center">
        {sliderImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="Oktay Berber Slider"
            className={`transition-opacity duration-700 absolute w-full h-full object-contain rounded-2xl shadow-xl ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{ maxHeight: '500px', minHeight: '260px' }}
          />
        ))}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl" />
      </div>
      <button onClick={prev} className="z-20 absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md"><i className="fas fa-chevron-left text-2xl text-amber-700"></i></button>
      <button onClick={next} className="z-20 absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md"><i className="fas fa-chevron-right text-2xl text-amber-700"></i></button>
    </div>
  );
}

function App() {
  // Form alanları için state'ler (Genel Randevu Formu için)
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Varsayılan: Bugün
  const [selectedTime, setSelectedTime] = useState('09:00'); // Varsayılan: 09:00
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null); // Servis ID'si number
  const [services, setServices] = useState<Service[]>([]); // Servis listesi
  const [loading, setLoading] = useState(false); // Genel yüklenme durumu

  // Telefon doğrulama için state'ler (Bu kısım API ile haberleşecek şekilde güncellendi)
  const [enteredCode, setEnteredCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false); // Kod gönderme spinner'ı için
  const [isVerifyingCode, setIsVerifyingCode] = useState(false); // Kod doğrulama spinner'ı için

  // Genel mesaj ve mesaj tipi state'leri (hem form hem admin için)
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Mesajın belirli bir süre sonra kaybolması için useEffect
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Formu temizleme fonksiyonu (Genel Randevu Formu için)
  const clearForm = () => {
    setName('');
    setSurname('');
    setPhone('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedTime('09:00');
    setSelectedServiceId(services.length > 0 ? services[0].servisID : null);
    setEnteredCode('');
    setIsCodeSent(false);
    setIsPhoneVerified(false);
  };

  // Telefon doğrulama kodu gönderme (API ile)
  const handleSendCode = async () => {
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setMessage('Lütfen geçerli bir 10 haneli telefon numarası girin.');
      setMessageType('error');
      return;
    }

    setIsSendingCode(true); // Spinner'ı etkinleştir
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`${API_BASE_URL}/PhoneVerification/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: cleanedPhone }),
      });

      if (response.ok) {
        setMessage('Doğrulama kodu telefonunuza gönderildi.');
        setMessageType('success');
        setIsCodeSent(true);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
        setMessageType('error');
        setIsCodeSent(false);
      }
    } catch (error) {
      console.error('Doğrulama kodu gönderilirken hata oluştu:', error);
      setMessage('Kod gönderilirken bir hata oluştu. Lütfen ağ bağlantınızı kontrol edin.');
      setMessageType('error');
      setIsCodeSent(false);
    } finally {
      setIsSendingCode(false); // Spinner'ı devre dışı bırak
    }
  };

  // Telefon doğrulama kodu kontrolü (API ile)
  const handleVerifyCode = async () => {
    setMessage('');
    setMessageType('');

    if (!enteredCode || enteredCode.length !== 6) {
      setMessage('Lütfen 6 haneli doğrulama kodunu girin.');
      setMessageType('error');
      return;
    }

    setIsVerifyingCode(true); // Spinner'ı etkinleştir

    const cleanedPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch(`${API_BASE_URL}/PhoneVerification/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: cleanedPhone, code: enteredCode }),
      });

      if (response.ok) {
        setMessage('Telefon numaranız başarıyla doğrulandı!');
        setMessageType('success');
        setIsPhoneVerified(true);
        setIsCodeSent(false); // Kod doğrulandıktan sonra kod gönderme alanını gizle
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Yanlış doğrulama kodu. Lütfen tekrar deneyin.');
        setMessageType('error');
        setIsPhoneVerified(false);
      }
    } catch (error) {
      console.error('Doğrulama kodu doğrulanırken hata oluştu:', error);
      setMessage('Kod doğrulanırken bir hata oluştu. Lütfen ağ bağlantınızı kontrol edin.');
      setMessageType('error');
      setIsPhoneVerified(false);
    } finally {
      setIsVerifyingCode(false); // Spinner'ı devre dışı bırak
    }
  };

  // Randevu gönderme işlemi (Genel Randevu Formu için)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!name.trim() || !surname.trim() || !phone.trim() || !selectedDate || !selectedTime || selectedServiceId === null) {
      setMessage('Lütfen tüm alanları doldurun.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (!isPhoneVerified) {
      setMessage('Lütfen telefon numaranızı doğrulayın.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setMessage('Lütfen geçerli bir 10 haneli telefon numarası girin.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);
    if (isNaN(appointmentDateTime.getTime())) {
      setMessage('Geçersiz tarih veya saat formatı.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (appointmentDateTime < new Date()) {
      setMessage('Geçmiş bir tarihe veya saate randevu alamazsınız.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const selectedService = services.find(s => s.servisID === selectedServiceId);
    if (!selectedService) {
      setMessage('Geçersiz servis seçimi.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // API'ye gönderilecek veri yapısı (C# API'nizin beklediği DTO'ya uygun olmalı)
    const appointmentData = {
      Customer: {
        Ad: name.trim(),
        Soyad: surname.trim(),
        Telefon: cleanedPhone,
      },
      Appointment: {
        RandevuZamani: appointmentDateTime.toISOString(),
        ServisID: selectedService.servisID, // serviceden gelen servisID
        Ucret: selectedService.varsayilanUcret || 0, // varsayilanUcret null/undefined ise 0 kullan
        Aciklama: 'Web sitesi üzerinden randevu',
        Tamamlandimi: false,
      },
    };

    console.log('Randevu verisi (API\'ye gönderilecek):', appointmentData);

    try {
      const response = await fetch(`${API_BASE_URL}/Appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Randevu oluşturulurken hata! Durum: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors) {
            errorMessage += '\nDetaylar:\n' + Object.values(errorJson.errors).flat().join('\n');
          } else if (errorJson.title) { // Genellikle default hata mesajları için
            errorMessage += '\nDetay: ' + errorJson.title;
          } else {
            errorMessage += '\nDetay: ' + errorText;
          }
        } catch (parseError) {
          errorMessage += '\nDetay: ' + errorText;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Randevu başarıyla oluşturuldu:', result);
      setMessage(`Randevunuz başarıyla oluşturuldu! Randevu ID: ${result.randevuID}`); // API'den dönen ID'yi göster
      setMessageType('success');
      clearForm();
    } catch (error: any) {
      console.error('Randevu oluşturulurken hata oluştu:', error);
      setMessage(`Randevu oluşturulurken hata oluştu: ${error.message || 'Bilinmeyen bir hata.'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Servisleri API'den çekme (hem ana form hem admin paneli için)
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');
    try {
      const response = await fetch(`${API_BASE_URL}/Services`);
      if (!response.ok) {
        throw new Error(`HTTP hata! Durum: ${response.status} - ${response.statusText}`);
      }
      const responseData = await response.json();
      const data: Service[] = responseData.$values || responseData;
      data.sort((a, b) => (a.servisAdi || '').localeCompare(b.servisAdi || ''));
      setServices(data);
      if (data.length > 0) {
        if (selectedServiceId === null || !data.some(s => s.servisID === selectedServiceId)) {
          setSelectedServiceId(data[0].servisID);
        }
      } else {
        setSelectedServiceId(null);
      }
      setLoading(false);
      console.log('Servisler API\'den başarıyla çekildi ve işlendi:', data);
    } catch (error: any) {
      console.error('Servisler çekilirken hata oluştu:', error);
      setMessage('Bakım sebebiyle servisler sekmesi şuanda hizmet vermiyor. Lütfen daha sonra tekrar deneyiniz.');
      setMessageType('error');
      setServices([]);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Section referansları
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const contactRef = useRef(null);

  // Aktif section state'i
  const [activeSection, setActiveSection] = useState('home');

  // Scroll ile aktif section'ı belirle
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'home', ref: homeRef },
        { id: 'about', ref: aboutRef },
        { id: 'services', ref: servicesRef },
        { id: 'contact', ref: contactRef },
      ];
      const scrollY = window.scrollY + 100; // Navbar yüksekliği kadar offset
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i].ref.current;
        if (section && (section as HTMLElement).offsetTop <= scrollY) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navbar'dan scroll ile section'a geçiş
  const scrollToSection = (section: string) => {
    const refs: any = {
      home: homeRef,
      about: aboutRef,
      services: servicesRef,
      contact: contactRef,
    };
    const ref = refs[section];
    if (ref && ref.current) {
      (ref.current as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Randevu alma sayfası için state
  const [showAppointment, setShowAppointment] = useState(false);

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // 5 saniyede bir değişsin
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Arka plan görseli fade geçişli */}
      {backgroundImages.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Oktay Berber Arka Plan"
          className={`fixed top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${i === bgIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{ pointerEvents: 'none' }}
        />
      ))}
      {/* İçeriklerin arka planı yarı saydam overlay */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm min-h-screen">
        <Navbar activeSection={activeSection} scrollToSection={scrollToSection} setShowAppointment={setShowAppointment} />
        <main className="flex-1 pt-16"> {/* pt-16: navbar yüksekliği kadar boşluk */}
          <section id="home" ref={homeRef} className="py-10 md:py-16 animate-fade-in-section"><Home scrollToSection={scrollToSection} setShowAppointment={setShowAppointment} /></section>
          <section id="about" ref={aboutRef} className="py-10 md:py-16 animate-fade-in-section"><About /></section>
          {/* Saydam boşluk ve slider */}
          <div className="w-full flex justify-center items-center my-2 md:my-4">
            <div className="w-full max-w-3xl mx-auto">
              <PhotoSlider />
            </div>
          </div>
          <section id="services" ref={servicesRef} className="py-10 md:py-16 animate-fade-in-section"><Services /></section>
          <section id="contact" ref={contactRef} className="py-10 md:py-16 animate-fade-in-section"><Contact /></section>
          {showAppointment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative">
                <button className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-red-500" onClick={() => setShowAppointment(false)}>&times;</button>
                <AppointmentPage
                  name={name} setName={setName}
                  surname={surname} setSurname={setSurname}
                  phone={phone} setPhone={setPhone}
                  selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime} setSelectedTime={setSelectedTime}
                  selectedServiceId={selectedServiceId} setSelectedServiceId={setSelectedServiceId}
                  services={services} loading={loading}
                  enteredCode={enteredCode} setEnteredCode={setEnteredCode}
                  isCodeSent={isCodeSent} isPhoneVerified={isPhoneVerified}
                  isSendingCode={isSendingCode} isVerifyingCode={isVerifyingCode}
                  handleSendCode={handleSendCode} handleVerifyCode={handleVerifyCode}
                  handleSubmit={handleSubmit}
                  message={message} messageType={messageType}
                />
              </div>
            </div>
          )}
        </main>
        <Footer />
        {/* Hareketli dekoratif daireler */}
        <div className="pointer-events-none fixed top-1/4 left-0 w-40 h-40 bg-amber-200/40 rounded-full blur-2xl animate-pulse -z-10" />
        <div className="pointer-events-none fixed bottom-10 right-0 w-52 h-52 bg-orange-300/30 rounded-full blur-2xl animate-pulse -z-10" />
      </div>
    </div>
  );
}

export default App;