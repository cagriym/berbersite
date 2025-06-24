import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import About from './About';
import Services from './Services';
import Contact from './Contact';
import AppointmentPage from './AppointmentPage';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net/api';

interface Service {
  servisID: number;
  servisAdi: string;
  varsayilanUcret: number | null | undefined;
}

function StilGalerisiSlider() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        adaptiveHeight: true,
        className: 'photo-slider'
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Slider {...settings}>
                <div className="p-0 m-0 bg-transparent overflow-hidden">
                    <img src="/oktayberber1.png" alt="Oktay Berber 1" className="w-full h-[500px] object-cover rounded-lg" />
                </div>
                <div className="p-0 m-0 bg-transparent overflow-hidden">
                    <img src="/oktayberber2.png" alt="Oktay Berber 2" className="w-full h-[500px] object-cover rounded-lg" />
                </div>
                <div className="p-0 m-0 bg-transparent overflow-hidden">
                    <img src="/oktayberber3.png" alt="Oktay Berber 3" className="w-full h-[500px] object-cover rounded-lg" />
                </div>
                <div className="p-0 m-0 bg-transparent overflow-hidden">
                    <img src="/oktayberber4.png" alt="Oktay Berber 4" className="w-full h-[500px] object-cover rounded-lg" />
                </div>
            </Slider>
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
        
        // Telefon numarası kontrolü - aynı numara ile kayıtlı müşteri var mı?
        try {
          const customerCheckResponse = await fetch(`${API_BASE_URL}/Musteriler`);
          if (customerCheckResponse.ok) {
            const customers = await customerCheckResponse.json();
            const existingCustomer = customers.find((c: any) => c.telefon === cleanedPhone);
            if (existingCustomer) {
              setMessage('Bu telefon numarası zaten kayıtlı! Lütfen farklı bir numara kullanın.');
              setMessageType('error');
              return;
            }
          }
        } catch (error) {
          console.error('Müşteri kontrolü sırasında hata:', error);
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

        try {
          // Müşteri oluştur
          const customerResponse = await fetch(`${API_BASE_URL}/Musteriler`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ad: name.trim(),
              soyad: surname.trim(),
              telefon: phone.replace(/\D/g, ''),
            }),
          });

          if (!customerResponse.ok) {
            throw new Error('Müşteri oluşturulamadı');
          }

          const customerData = await customerResponse.json();
          const musteriID = customerData.musteriID;

          // Randevu oluştur
          const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);
          const appointmentResponse = await fetch(`${API_BASE_URL}/Appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              musteriID: musteriID,
              randevuZamani: appointmentDateTime.toISOString(),
              ucret: totalPrice,
              tamamlandimi: false,
            }),
          });

          if (!appointmentResponse.ok) {
            throw new Error('Randevu oluşturulamadı');
          }

          const appointmentData = await appointmentResponse.json();
          const randevuID = appointmentData.randevuID;

          // Randevu detayları oluştur
          const detailPromises = selectedServiceIds.map(servisID =>
            fetch(`${API_BASE_URL}/RandevuDetaylari`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                randevuID: randevuID,
                servisID: servisID,
              }),
            })
          );

          await Promise.all(detailPromises);

          setMessage(`Randevunuz başarıyla oluşturuldu!\n\nRandevu Detayları:\nAd Soyad: ${name} ${surname}\nTarih: ${selectedDate}\nSaat: ${selectedTime}\nToplam Ücret: ${totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}\n\nRandevu numaranız: ${randevuID}`);
          setMessageType('success');
          clearForm();
          setShowAppointment(false);
        } catch (error) {
          console.error('Randevu oluşturulurken hata:', error);
          setMessage('Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
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
            } else {
                throw new Error('Servisler yüklenemedi.');
            }
        } catch (error) {
            setMessage('Servisler yüklenirken bir hata oluştu.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Mevcut randevuları getir ve müsait olmayan saatleri hesapla
    const getUnavailableTimes = async (selectedDate: string): Promise<string[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/Appointments`);
            if (response.ok) {
                const appointments = await response.json();
                const unavailableTimes: string[] = [];
                
                appointments.forEach((app: any) => {
                    const appDate = new Date(app.randevuZamani).toDateString();
                    const selectedDateObj = new Date(selectedDate).toDateString();
                    
                    if (appDate === selectedDateObj) {
                        const appTime = new Date(app.randevuZamani);
                        const appHour = appTime.getHours();
                        const appMinute = appTime.getMinutes();
                        
                        // Sadece randevu alınan saati müsait değil olarak işaretle
                        if (appHour >= 9 && appHour <= 20) { // Çalışma saatleri
                            const timeString = `${appHour.toString().padStart(2, '0')}:${appMinute.toString().padStart(2, '0')}`;
                            if (!unavailableTimes.includes(timeString)) {
                                unavailableTimes.push(timeString);
                            }
                        }
                    }
                });
                
                return unavailableTimes;
            }
        } catch (error) {
            console.error('Müsait olmayan saatler alınırken hata:', error);
        }
        return [];
    };

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

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
                {/* Stil Galerimiz Bölümü */}
                <div className="w-full py-16 px-2 bg-[#1a2236]">
                  <div className="max-w-3xl mx-auto rounded-xl shadow-lg bg-[#fdf9ea] flex justify-center items-center" style={{ minHeight: '650px' }}>
                    <div className="w-full flex justify-center items-center pt-20 pb-8">
                      <StilGalerisiSlider />
                    </div>
                  </div>
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
                        getUnavailableTimes={getUnavailableTimes}
                    />
                )}
                <section ref={contactRef} id="contact"><Contact /></section>
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout; 