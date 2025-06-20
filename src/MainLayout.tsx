import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import About from './About';
import Services from './Services';
import Contact from './Contact';
import AppointmentPage from './AppointmentPage';

const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net/api';

interface Service {
  servisID: number;
  servisAdi: string;
  varsayilanUcret: number | null | undefined;
}

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

const MainLayout = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [enteredCode, setEnteredCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [showAppointment, setShowAppointment] = useState(false);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const clearForm = useCallback(() => {
        setName('');
        setSurname('');
        setPhone('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedTime('09:00');
        setSelectedServiceIds([]);
        setEnteredCode('');
        setIsCodeSent(false);
        setIsPhoneVerified(false);
    }, []);

    const handleSendCode = async () => {
        const cleanedPhone = phone.replace(/\D/g, '');
        if (cleanedPhone.length !== 10) {
          setMessage('Lütfen geçerli bir 10 haneli telefon numarası girin.');
          setMessageType('error');
          return;
        }
        setIsSendingCode(true);
        setMessage('');
        setMessageType('');
        try {
          const response = await fetch(`${API_BASE_URL}/PhoneVerification/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
          setIsSendingCode(false);
        }
      };
    
      const handleVerifyCode = async () => {
        setMessage('');
        setMessageType('');
        if (!enteredCode || enteredCode.length !== 6) {
          setMessage('Lütfen 6 haneli doğrulama kodunu girin.');
          setMessageType('error');
          return;
        }
        setIsVerifyingCode(true);
        const cleanedPhone = phone.replace(/\D/g, '');
        try {
          const response = await fetch(`${API_BASE_URL}/PhoneVerification/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: cleanedPhone, code: enteredCode }),
          });
          if (response.ok) {
            setMessage('Telefon numaranız başarıyla doğrulandı!');
            setMessageType('success');
            setIsPhoneVerified(true);
            setIsCodeSent(false);
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
          setIsVerifyingCode(false);
        }
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');
        if (!name.trim() || !surname.trim() || !phone.trim() || !selectedDate || !selectedTime || selectedServiceIds.length === 0) {
          setMessage('Lütfen tüm alanları doldurun ve en az bir servis seçin.');
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
        const randevuData = {
          customer: { ad: name, soyad: surname, telefon: cleanedPhone },
          appointment: {
            servisIDList: selectedServiceIds,
            randevuZamani: appointmentDateTime.toISOString(),
            aciklama: 'Randevu web sitesinden alındı.',
            ucret: totalPrice
          }
        };
        try {
          const response = await fetch(`${API_BASE_URL}/Appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(randevuData)
          });
          if (response.ok) {
            setMessage('Randevunuz başarıyla oluşturuldu! Sizinle en kısa sürede iletişime geçeceğiz.');
            setMessageType('success');
            clearForm();
            setShowAppointment(false);
          } else {
            const errorText = await response.text();
            setMessage(errorText || 'Randevu oluşturulurken bir hata oluştu.');
            setMessageType('error');
          }
        } catch (error: any) {
          setMessage(`Bir ağ hatası oluştu: ${error.message}`);
          setMessageType('error');
        } finally {
          setLoading(false);
        }
      };

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/Services`);
            if (response.ok) {
                const data: Service[] = await response.json();
                setServices(data);
                if (data.length > 0 && selectedServiceIds.length === 0) {
                    setSelectedServiceIds([data[0].servisID]);
                }
            } else {
                throw new Error('Servisler yüklenemedi.');
            }
        } catch (error) {
            setMessage('Servisler yüklenirken bir hata oluştu.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    }, [selectedServiceIds]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    useEffect(() => {
        if (services.length > 0 && selectedServiceIds.length === 0) {
            setSelectedServiceIds([services[0].servisID]);
        }
    }, [services, selectedServiceIds.length]);

    useEffect(() => {
        // Toplam ücreti hesapla
        const total = services.filter(s => selectedServiceIds.includes(s.servisID)).reduce((sum, s) => sum + (s.varsayilanUcret || 0), 0);
        setTotalPrice(total);
    }, [selectedServiceIds, services]);

    const homeRef = useRef<HTMLDivElement>(null);
    const aboutRef = useRef<HTMLDivElement>(null);
    const servicesRef = useRef<HTMLDivElement>(null);
    const contactRef = useRef<HTMLDivElement>(null);
    
    const [activeSection, setActiveSection] = useState('home');

    const scrollToSection = (sectionId: string) => {
        let element;
        if (sectionId === 'home') element = homeRef.current;
        if (sectionId === 'about') element = aboutRef.current;
        if (sectionId === 'services') element = servicesRef.current;
        if (sectionId === 'contact') element = contactRef.current;
        
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const refs = [
            { id: 'home', ref: homeRef },
            { id: 'about', ref: aboutRef },
            { id: 'services', ref: servicesRef },
            { id: 'contact', ref: contactRef }
        ];

        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            let currentSection = '';
            for (const section of refs) {
                if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
                    currentSection = section.id;
                }
            }
            if (currentSection) {
                setActiveSection(currentSection);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-stone-50 to-amber-100 text-stone-800 font-sans">
            <Navbar activeSection={activeSection} scrollToSection={scrollToSection} setShowAppointment={setShowAppointment} />
            <main className="flex-grow pt-16">
                <section ref={homeRef} id="home"><Home scrollToSection={scrollToSection} setShowAppointment={setShowAppointment} /></section>
                <section ref={aboutRef} id="about"><About /></section>
                <div className="container mx-auto px-4 py-12">
                    <h2 className="text-4xl font-bold text-center text-amber-800 mb-12">Stil Galerimiz</h2>
                    <PhotoSlider />
                </div>
                <section ref={servicesRef} id="services"><Services services={services} /></section>
                {showAppointment && (
                    <AppointmentPage
                        name={name}
                        setName={setName}
                        surname={surname}
                        setSurname={setSurname}
                        phone={phone}
                        setPhone={setPhone}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                        selectedServiceIds={selectedServiceIds}
                        setSelectedServiceIds={setSelectedServiceIds}
                        services={services}
                        totalPrice={totalPrice}
                        loading={loading}
                        enteredCode={enteredCode}
                        setEnteredCode={setEnteredCode}
                        isCodeSent={isCodeSent}
                        isPhoneVerified={isPhoneVerified}
                        isSendingCode={isSendingCode}
                        isVerifyingCode={isVerifyingCode}
                        message={message}
                        messageType={messageType}
                        handleSendCode={handleSendCode}
                        handleVerifyCode={handleVerifyCode}
                        handleSubmit={handleSubmit}
                        closeModal={() => setShowAppointment(false)}
                    />
                )}
                <section ref={contactRef} id="contact"><Contact /></section>
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout; 