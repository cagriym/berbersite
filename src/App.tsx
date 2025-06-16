import React, { useState, useEffect, useCallback } from 'react';

// API'nızın çalıştığı temel URL
// Genellikle ASP.NET Core projelerinde 7075 (HTTPS) veya 5000/5001 (HTTP) gibi bir port kullanılır.
// Lütfen kendi API'nızın çalıştığı doğru URL'yi kontrol edin.
const API_BASE_URL = 'https://localhost:7075/api';

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

// Ana uygulama bileşeni
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

  // Telefon doğrulama için state'ler (Bu kısım şu an client-side simülasyonu)
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Genel mesaj ve mesaj tipi state'leri (hem form hem admin için)
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Yönetici paneli state'leri
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Admin paneli için randevular
  const [needs, setNeeds] = useState<Need[]>([]); // Admin paneli için ihtiyaçlar
  const [adminLoading, setAdminLoading] = useState(false); // Admin paneli yüklenme durumu
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Admin Panelindeki Randevu Ekleme Formu için State'ler
  const [adminNewCustomerAd, setAdminNewCustomerAd] = useState('');
  const [adminNewCustomerSoyad, setAdminNewCustomerSoyad] = useState('');
  const [adminNewCustomerTelefon, setAdminNewCustomerTelefon] = useState('');
  const [adminNewAppointmentDate, setAdminNewAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminNewAppointmentTime, setAdminNewAppointmentTime] = useState('09:00');
  const [adminNewServiceId, setAdminNewServiceId] = useState<number | null>(null);
  const [adminNewAppointmentAciklama, setAdminNewAppointmentAciklama] = useState('');

  // Admin Panelindeki İhtiyaç Ekleme Formu için State'ler
  const [newNeedName, setNewNeedName] = useState('');
  const [newNeedAmount, setNewNeedAmount] = useState(1);
  const [newNeedUnitPrice, setNewNeedUnitPrice] = useState('');

  // Mali Durum State'leri
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);


  // Basit yönlendirme (React Router kullanılamadığı için)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sayfa yolu değiştiğinde currentPath'i güncelle
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

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
    setVerificationCode('');
    setEnteredCode('');
    setIsCodeSent(false);
    setIsPhoneVerified(false);
  };

  // Telefon doğrulama kodu gönderme (geçici - konsola yazdırılır)
  const handleSendCode = () => {
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setMessage('Lütfen geçerli bir 10 haneli telefon numarası girin.');
      setMessageType('error');
      return;
    }

    setIsSendingCode(true);
    setMessage('');
    setMessageType('');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    setTimeout(() => {
      console.log(`Telefon doğrulama kodu gönderildi: ${code}`);
      setMessage(`Doğrulama kodu telefonunuza gönderildi. Lütfen konsolu kontrol edin. Kod: ${code}`);
      setMessageType('success');
      setIsCodeSent(true);
      setIsSendingCode(false);
    }, 1500);
  };

  // Telefon doğrulama kodu kontrolü
  const handleVerifyCode = () => {
    setMessage('');
    setMessageType('');
    if (enteredCode === verificationCode) {
      setMessage('Telefon numaranız başarıyla doğrulandı!');
      setMessageType('success');
      setIsPhoneVerified(true);
    } else {
      setMessage('Yanlış doğrulama kodu. Lütfen tekrar deneyin.');
      setMessageType('error');
      setIsPhoneVerified(false);
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
      // Veriyi doğrudan kullan, $values veya benzeri bir sarıcı varsa kaldırıldı
      const data: Service[] = responseData.$values || responseData; // API'niz $values dönüyorsa hala bu satır kalsın

      // Hata ayıklama için: API'den gelen ham servis verisini konsola yazdır
      console.log('API\'den çekilen ham servis verisi:', data);

      // Servisleri servisAdi'ye göre sırala
      data.sort((a, b) => (a.servisAdi || '').localeCompare(b.servisAdi || ''));
      setServices(data);
      
      // Eğer hiç servis seçilmediyse veya seçilen servis artık yoksa ilk servisi seç
      if (data.length > 0) {
        if (selectedServiceId === null || !data.some(s => s.servisID === selectedServiceId)) {
          setSelectedServiceId(data[0].servisID);
        }
        if (adminNewServiceId === null || !data.some(s => s.servisID === adminNewServiceId)) {
          setAdminNewServiceId(data[0].servisID);
        }
      } else {
        setSelectedServiceId(null);
        setAdminNewServiceId(null);
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
  }, [selectedServiceId, adminNewServiceId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);


  // Yönetici Paneli Fonksiyonları
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === '1234') { // Basit client-side admin doğrulaması
      setIsAdminLoggedIn(true);
      navigate('/admin');
      setMessage('Yönetici girişi başarılı!');
      setMessageType('success');
    } else {
      setMessage('Yanlış kullanıcı adı veya şifre.');
      setMessageType('error');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUsername('');
    setAdminPassword('');
    navigate('/admin/login');
    setMessage('Çıkış yapıldı.');
    setMessageType('success');
  };

  // Admin Paneli: Randevuları çekme
  const fetchAppointments = useCallback(async () => {
    if (!isAdminLoggedIn) return; // Sadece admin girişliyse çek

    setAdminLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Appointments`);
      if (!response.ok) {
        throw new Error(`HTTP hata! Durum: ${response.status} - ${response.statusText}`);
      }
      const responseData = await response.json();
      const data: Appointment[] = responseData.$values || responseData;

      // Randevuları tarihe göre azalan sırada sırala (en yeni üstte)
      data.sort((a, b) => new Date(b.randevuZamani).getTime() - new Date(a.randevuZamani).getTime());
      setAppointments(data);
      setAdminLoading(false);
      console.log('Admin: Randevular API\'den çekildi:', data);
    } catch (error: any) {
      console.error('Admin: Randevular çekilirken hata oluştu:', error);
      setMessage(`Admin: Randevular yüklenirken bir hata oluştu: ${error.message}`);
      setMessageType('error');
      setAdminLoading(false);
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (currentPath === '/admin' && isAdminLoggedIn) {
      fetchAppointments();
    }
  }, [currentPath, isAdminLoggedIn, fetchAppointments]);

  // Admin Paneli: Randevu Silme
  const handleDeleteAppointment = async (id: number) => { // ID artık number
    setAdminLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Appointments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP hata! Durum: ${response.status} - ${response.statusText}`);
      }
      setMessage('Randevu başarıyla silindi!');
      setMessageType('success');
      fetchAppointments(); // Listeyi yenile
    } catch (error: any) {
      console.error('Randevu silinirken hata oluştu:', error);
      setMessage(`Randevu silinirken hata oluştu: ${error.message}`);
      setMessageType('error');
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin Paneli: Randevu Ekleme
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminNewCustomerAd.trim() || !adminNewCustomerTelefon.trim() || // Soyad zorunlu değilse kaldırılabilir
        !adminNewAppointmentDate || !adminNewAppointmentTime || adminNewServiceId === null) {
      setMessage('Lütfen tüm randevu ekleme alanlarını doldurun.');
      setMessageType('error');
      return;
    }

    const cleanedPhone = adminNewCustomerTelefon.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setMessage('Admin: Lütfen geçerli bir 10 haneli telefon numarası girin.');
      setMessageType('error');
      return;
    }

    const appointmentDateTime = new Date(`${adminNewAppointmentDate}T${adminNewAppointmentTime}`);
    if (isNaN(appointmentDateTime.getTime())) {
      setMessage('Admin: Geçersiz tarih veya saat formatı.');
      setMessageType('error');
      return;
    }

    const selectedService = services.find(s => s.servisID === adminNewServiceId);
    if (!selectedService) {
      setMessage('Admin: Geçersiz servis seçimi.');
      setMessageType('error');
      return;
    }

    setAdminLoading(true);
    try {
      const appointmentData = {
        Customer: {
          Ad: adminNewCustomerAd.trim(),
          Soyad: adminNewCustomerSoyad.trim(), // Boş da gönderilebilir
          Telefon: cleanedPhone,
        },
        Appointment: {
          RandevuZamani: appointmentDateTime.toISOString(),
          ServisID: selectedService.servisID,
          Ucret: selectedService.varsayilanUcret || 0, // varsayilanUcret null/undefined ise 0 kullan
          Aciklama: adminNewAppointmentAciklama.trim() || 'Admin panelinden eklendi',
          Tamamlandimi: false,
        },
      };

      const response = await fetch(`${API_BASE_URL}/Appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Admin: Randevu eklenirken hata! Durum: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors) {
            errorMessage += '\nDetaylar:\n' + Object.values(errorJson.errors).flat().join('\n');
          } else if (errorJson.title) {
            errorMessage += '\nDetay: ' + errorJson.title;
          } else {
            errorMessage += '\nDetay: ' + errorText;
          }
        } catch (parseError) {
          errorMessage += '\nDetay: ' + errorText;
        }
        throw new Error(errorMessage);
      }

      setMessage('Randevu başarıyla eklendi!');
      setMessageType('success');
      // Formu temizle
      setAdminNewCustomerAd('');
      setAdminNewCustomerSoyad('');
      setAdminNewCustomerTelefon('');
      setAdminNewAppointmentDate(new Date().toISOString().split('T')[0]);
      setAdminNewAppointmentTime('09:00');
      setAdminNewAppointmentAciklama('');
      fetchAppointments(); // Listeyi yenile
    } catch (error: any) {
      console.error('Admin: Randevu eklenirken hata oluştu:', error);
      setMessage(`Admin: Randevu eklenirken hata oluştu: ${error.message}`);
      setMessageType('error');
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin Paneli: Servis Ekleme
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newServiceName.trim() || isNaN(parseFloat(newServicePrice))) {
      setMessage('Lütfen geçerli bir servis adı ve ücreti girin.');
      setMessageType('error');
      return;
    }

    setAdminLoading(true);
    try {
      const serviceData = {
        servisAdi: newServiceName.trim(), // camelCase
        varsayilanUcret: parseFloat(newServicePrice), // camelCase
      };

      const response = await fetch(`${API_BASE_URL}/Services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Servis eklenirken hata! Durum: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.title) {
            errorMessage += '\nDetay: ' + errorJson.title;
          } else {
            errorMessage += '\nDetay: ' + errorText;
          }
        } catch (parseError) {
          errorMessage += '\nDetay: ' + errorText;
        }
        throw new Error(errorMessage);
      }
      
      setMessage(`Servis "${newServiceName}" başarıyla eklendi!`);
      setMessageType('success');
      setNewServiceName('');
      setNewServicePrice('');
      fetchServices(); // Servis listesini yenile
    } catch (error: any) {
      console.error('Servis eklenirken hata oluştu:', error);
      setMessage(`Servis eklenirken hata oluştu: ${error.message}`);
      setMessageType('error');
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin Paneli: Servis Silme
  const handleDeleteService = async (id: number) => {
    setAdminLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Services/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP hata! Durum: ${response.status} - ${response.statusText}`);
      }
      setMessage('Servis başarıyla silindi!');
      setMessageType('success');
      fetchServices(); // Servis listesini yenile
    } catch (error: any) {
      console.error('Servis silinirken hata oluştu:', error);
      setMessage(`Servis silinirken hata oluştu: ${error.message}`);
      setMessageType('error');
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin Paneli: İhtiyaçları çekme
  const fetchNeeds = useCallback(async () => {
    if (!isAdminLoggedIn) return; // Sadece admin girişliyse çek

    setAdminLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Needs`); // Varsayılan Needs API endpointi
      if (!response.ok) {
        throw new Error(`HTTP hata! Durum: ${response.status} - ${response.statusText}`);
      }
      const responseData = await response.json();
      const data: Need[] = responseData.$values || responseData;

      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // camelCase
      setNeeds(data);
      setAdminLoading(false);
      console.log('Admin: İhtiyaçlar API\'den çekildi:', data);
    } catch (error: any) {
      console.error('Admin: İhtiyaçlar çekilirken hata oluştu:', error);
      setMessage(`Admin: İhtiyaçlar yüklenirken bir hata oluştu: ${error.message}`);
      setMessageType('error');
      setAdminLoading(false);
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (currentPath === '/admin' && isAdminLoggedIn) {
      fetchNeeds();
    }
  }, [currentPath, isAdminLoggedIn, fetchNeeds]);

  // Admin Paneli: İhtiyaç Ekleme
  const handleAddNeed = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNeedName.trim() || newNeedAmount <= 0 || isNaN(parseFloat(newNeedUnitPrice)) || parseFloat(newNeedUnitPrice) <= 0) {
      setMessage('Lütfen geçerli bir ihtiyaç adı, miktarı ve birim fiyatı girin.');
      setMessageType('error');
      return;
    }

    setAdminLoading(true);
    try {
      const unitPrice = parseFloat(newNeedUnitPrice);
      const totalPrice = newNeedAmount * unitPrice;

      const needData = {
        ad: newNeedName.trim(), // camelCase
        miktar: newNeedAmount, // camelCase
        birimFiyat: unitPrice, // camelCase
        toplamFiyat: totalPrice, // camelCase
      };

      const response = await fetch(`${API_BASE_URL}/Needs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(needData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `İhtiyaç eklenirken hata! Durum: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.title) {
            errorMessage += '\nDetay: ' + errorJson.title;
          } else {
            errorMessage += '\nDetay: ' + errorText;
          }
        } catch (parseError) {
          errorMessage += '\nDetay: ' + errorText;
        }
        throw new Error(errorMessage);
      }

      setMessage(`İhtiyaç "${newNeedName}" başarıyla eklendi!`);
      setMessageType('success');
      setNewNeedName('');
      setNewNeedAmount(1);
      setNewNeedUnitPrice('');
      fetchNeeds(); // İhtiyaç listesini yenile
    } catch (error: any) {
      console.error('İhtiyaç eklenirken hata oluştu:', error);
      setMessage(`İhtiyaç eklenirken hata oluştu: ${error.message}`);
      setMessageType('error');
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin Paneli: İhtiyaç Silme
  const handleDeleteNeed = async (id: number) => {
    setAdminLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Needs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP hata! Durum: ${response.status} - ${response.statusText}`);
      }
      setMessage('İhtiyaç başarıyla silindi!');
      setMessageType('success');
      fetchNeeds(); // İhtiyaç listesini yenile
    } catch (error: any) {
      console.error('İhtiyaç silinirken hata oluştu:', error);
      setMessage(`İhtiyaç silinirken hata oluştu: ${error.message}`);
      setMessageType('error');
    } finally {
      setAdminLoading(false);
    }
  };

  // Mali Durum Verilerini Hesaplama (API'den çekilen veriler üzerinden)
  useEffect(() => {
    if (isAdminLoggedIn && currentPath === '/admin') {
      const currentTotalRevenue = appointments
        .filter(app => app.tamamlandimi) // Tamamlanmış randevuları filtrele
        .reduce((sum, app) => sum + (app.ucret || 0), 0); // ucret null/undefined ise 0 kullan
      setTotalRevenue(currentTotalRevenue);

      const currentTotalExpenses = needs.reduce((sum, need) => sum + (need.toplamFiyat || 0), 0); // toplamFiyat null/undefined ise 0 kullan
      setTotalExpenses(currentTotalExpenses);

      setNetProfit(currentTotalRevenue - currentTotalExpenses);
    }
  }, [appointments, needs, isAdminLoggedIn, currentPath]);


  // Pastadilimi Grafiği Bileşeni
  const PieChart = ({ revenue, expenses }: { revenue: number; expenses: number }) => {
    const total = revenue + expenses;
    if (total === 0) {
      return <div className="text-center text-gray-500">Gösterilecek mali veri bulunmamaktadır.</div>;
    }

    const revenuePercentage = (revenue / total) * 100;
    const expensesPercentage = (expenses / total) * 100;

    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    const revenueOffset = circumference - (revenuePercentage / 100) * circumference;
    const expensesOffset = circumference - (expensesPercentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <svg width="150" height="150" viewBox="0 0 100 100">
          {/* Expenses Slice (Kırmızı) */}
          {expenses > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#ef4444" // Kırmızı
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (expensesPercentage / 100) * circumference}
              transform={`rotate(-90 50 50)`}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          )}

          {/* Revenue Slice (Yeşil) */}
          {revenue > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#22c55e" // Yeşil
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={revenueOffset}
              transform={`rotate(${expensesPercentage * 3.6 - 90} 50 50)`} // Önce giderler, sonra gelirler
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          )}
        </svg>
        <div className="mt-4 text-center">
          <p className="text-green-600 font-semibold flex items-center justify-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-2"></span>
            Gelir: {revenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} ({revenuePercentage.toFixed(1)}%)
          </p>
          <p className="text-red-600 font-semibold flex items-center justify-center mt-1">
            <span className="inline-block w-3 h-3 rounded-full bg-red-600 mr-2"></span>
            Gider: {expenses.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} ({expensesPercentage.toFixed(1)}%)
          </p>
          <p className={`font-bold text-lg mt-2 ${netProfit >= 0 ? 'text-blue-700' : 'text-purple-700'}`}>
            Net Kar/Zarar: {netProfit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </p>
        </div>
      </div>
    );
  };


  // Render edilecek ana içerik
  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return (
          // Ana Randevu Formu İçeriği
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center font-inter p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <header className="w-full max-w-4xl bg-gradient-to-r from-amber-300 to-orange-400 text-gray-900 p-6 rounded-xl shadow-lg mb-8 text-center border-b-4 border-amber-500">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-900 drop-shadow-md">Oktay Saç Tasarım</h1>
              <p className="text-lg mt-2 text-amber-800">Online Randevu Alın</p>
              {/* Admin Paneli butonu kaldırıldı */}
            </header>

            {/* Randevu Formu Kartı */}
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-2xl border-2 border-amber-300 transform transition-all duration-300 hover:scale-[1.01]">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Randevu Formu</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* İsim */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Adınız</label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-200 ease-in-out hover:border-amber-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınızı girin"
                    required
                  />
                </div>

                {/* Soyisim */}
                <div>
                  <label htmlFor="surname" className="block text-sm font-semibold text-gray-700 mb-1">Soyadınız</label>
                  <input
                    type="text"
                    id="surname"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-200 ease-in-out hover:border-amber-400"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Soyadınızı girin"
                    required
                  />
                </div>

                {/* Telefon Numarası ve Doğrulama */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">Telefon Numaranız</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="tel"
                      id="phone"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-200 ease-in-out hover:border-amber-400"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setIsCodeSent(false); // Telefon değiştiğinde doğrulamayı sıfırla
                        setIsPhoneVerified(false);
                        setMessage('');
                        setMessageType('');
                      }}
                      placeholder="5XX XXX XX XX"
                      pattern="[0-9]{10}"
                      title="Lütfen 10 haneli bir telefon numarası girin (örneğin 5XXXXXXXXX)"
                      required
                      disabled={isPhoneVerified || isSendingCode} // Doğrulandıysa veya kod gönderiliyorsa devre dışı bırak
                    />
                    {!isCodeSent && !isPhoneVerified && (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        className={`px-4 py-2 rounded-lg shadow-md text-white font-medium transition duration-300 ease-in-out transform hover:scale-105 ${
                          phone.replace(/\D/g, '').length === 10 && !isSendingCode
                            ? 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        disabled={phone.replace(/\D/g, '').length !== 10 || isSendingCode}
                      >
                        {isSendingCode ? (
                          <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'Kod Gönder'
                        )}
                      </button>
                    )}
                  </div>

                  {isCodeSent && !isPhoneVerified && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-200 ease-in-out hover:border-amber-400"
                        placeholder="Doğrulama kodunu girin"
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        maxLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        className={`px-4 py-2 rounded-lg shadow-md text-white font-medium transition duration-300 ease-in-out transform hover:scale-105 ${
                          enteredCode.length === 6
                            ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        disabled={enteredCode.length !== 6}
                      >
                        Kodu Doğrula
                      </button>
                    </div>
                  )}

                  {isPhoneVerified && (
                    <p className="mt-2 text-green-600 text-sm font-medium flex items-center">
                      <i className="fas fa-check-circle mr-2"></i> Telefon numaranız doğrulandı!
                    </p>
                  )}
                </div>

                {/* Tarih ve Saat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1">Tarih</label>
                    <input
                      type="date"
                      id="date"
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-200 ease-in-out hover:border-amber-400"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} // Sadece bugünden itibaren tarih seçimi
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-semibold text-gray-700 mb-1">Saat</label>
                    <input
                      type="time"
                      id="time"
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-200 ease-in-out hover:border-amber-400"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Servis Seçimi */}
                <div>
                  <label htmlFor="service" className="block text-sm font-semibold text-gray-700 mb-1">Servis Seçimi</label>
                  {loading ? (
                    <p className="text-gray-500">Servisler yükleniyor...</p>
                  ) : services.length === 0 ? (
                    <p className="text-red-500">Bakım sebebiyle servisler sekmesi şuanda hizmet vermiyor. Lütfen daha sonra tekrar deneyiniz.</p>
                  ) : (
                    <select
                      id="service"
                      className="mt-1 block w-full pl-4 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-base rounded-lg shadow-sm transition duration-200 ease-in-out hover:border-amber-400"
                      value={selectedServiceId || ''}
                      onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                      required
                    >
                      {services.map((service) => {
                         // Her bir servis objesini konsola yazdır, debugging için
                         // console.log('Rendering Service:', service); // Artık gerekmeyebilir
                         return (
                            <option key={service.servisID} value={service.servisID}>
                              {service.servisAdi} ({
                                // varsayilanUcret null/undefined veya sayısal değilse "Ücret Bilinmiyor" göster
                                (typeof service.varsayilanUcret === 'number' && !isNaN(service.varsayilanUcret))
                                  ? service.varsayilanUcret.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                                  : 'Ücret Bilinmiyor'
                              })
                            </option>
                         );
                      })}
                    </select>
                  )}
                </div>

                {/* Mesaj Alanı */}
                {message && (
                  <div
                    className={`p-3 rounded-lg text-center text-sm font-medium ${
                      messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    } transition duration-300 ease-in-out`}
                  >
                    {message}
                  </div>
                )}

                {/* Randevu Al Butonu */}
                <button
                  type="submit"
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-300 ease-in-out transform hover:scale-105 ${
                    loading || !isPhoneVerified ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !isPhoneVerified}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Randevu Al'
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <footer className="w-full max-w-4xl text-center text-gray-700 mt-8 text-sm p-4 bg-amber-100 rounded-xl shadow-md">
              <p className="mb-2">&copy; {new Date().getFullYear()} Oktay Saç Tasarım. Tüm Hakları Saklıdır.</p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <a href="https://www.instagram.com/oktaygunsactasarim/" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 transition duration-200 flex items-center">
                  <i className="fab fa-instagram text-xl mr-1"></i> Instagram
                </a>
                <a href="https://wa.me/905308965315" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition duration-200 flex items-center">
                  <i className="fab fa-whatsapp text-xl mr-1"></i> 0530 896 53 15
                </a>
                <span className="flex items-center text-gray-700">
                  <i className="fas fa-map-marker-alt text-xl mr-1"></i> Cumhuriyet, 20. Sk., 55200 Atakum/Samsun
                </span>
              </div>
            </footer>
          </div>
        );

      case '/admin/login':
        return (
          // Admin Login Paneli
          <div className="min-h-screen bg-gray-100 flex items-center justify-center font-inter p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl border-2 border-blue-300">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Girişi</h2>
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div>
                  <label htmlFor="admin-username" className="block text-sm font-semibold text-gray-700 mb-1">Kullanıcı Adı</label>
                  <input
                    type="text"
                    id="admin-username"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-1">Şifre</label>
                  <input
                    type="password"
                    id="admin-password"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
                {message && (
                  <div
                    className={`p-3 rounded-lg text-center text-sm font-medium ${
                      messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {message}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg shadow-md font-bold hover:bg-blue-700 transition transform hover:scale-105"
                >
                  Giriş Yap
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full mt-3 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg shadow-md font-bold hover:bg-gray-400 transition"
                >
                    Ana Sayfaya Dön
                </button>
              </form>
            </div>
          </div>
        );

      case '/admin':
        if (!isAdminLoggedIn) {
          navigate('/admin/login');
          return null;
        }
        return (
          // Admin Dashboard
          <div className="min-h-screen bg-gray-50 flex flex-col items-center font-inter p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-5xl bg-blue-600 text-white p-6 rounded-xl shadow-lg mb-8 text-center border-b-4 border-blue-800">
              <h1 className="text-3xl sm:text-4xl font-extrabold drop-shadow-md">Yönetici Paneli</h1>
              <p className="text-lg mt-2 opacity-90">Hoş geldiniz, Admin!</p>
              <button onClick={handleAdminLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition">Çıkış Yap</button>
              <button onClick={() => navigate('/')} className="mt-4 ml-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">Randevu Formu</button>
            </header>

            {message && (
                <div
                    className={`w-full max-w-5xl p-3 rounded-lg text-center text-sm font-medium mb-6 ${
                        messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {message}
                </div>
            )}

            {adminLoading && (
              <div className="text-center text-blue-600 text-lg my-4">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Veriler yükleniyor...</p>
              </div>
            )}

            {/* Mali Durum Grafiği */}
            <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-2">Mali Durum</h3>
              <PieChart revenue={totalRevenue} expenses={totalExpenses} />
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Randevu Ekleme Formu */}
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Yeni Randevu Ekle</h3>
                <form onSubmit={handleAddAppointment} className="space-y-4">
                  <div>
                    <label htmlFor="adminNewCustomerAd" className="block text-sm font-semibold text-gray-700 mb-1">Müşteri Adı</label>
                    <input
                      type="text"
                      id="adminNewCustomerAd"
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={adminNewCustomerAd}
                      onChange={(e) => setAdminNewCustomerAd(e.target.value)}
                      placeholder="Müşteri adını girin"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="adminNewCustomerSoyad" className="block text-sm font-semibold text-gray-700 mb-1">Müşteri Soyadı</label>
                    <input
                      type="text"
                      id="adminNewCustomerSoyad"
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={adminNewCustomerSoyad}
                      onChange={(e) => setAdminNewCustomerSoyad(e.target.value)}
                      placeholder="Müşteri soyadını girin"
                    />
                  </div>
                  <div>
                    <label htmlFor="adminNewCustomerTelefon" className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
                    <input
                      type="tel"
                      id="adminNewCustomerTelefon"
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={adminNewCustomerTelefon}
                      onChange={(e) => setAdminNewCustomerTelefon(e.target.value)}
                      placeholder="5XX XXX XX XX"
                      pattern="[0-9]{10}"
                      title="Lütfen 10 haneli bir telefon numarası girin (örneğin 5XXXXXXXXX)"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="adminNewAppointmentDate" className="block text-sm font-semibold text-gray-700 mb-1">Tarih</label>
                      <input
                        type="date"
                        id="adminNewAppointmentDate"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={adminNewAppointmentDate}
                        onChange={(e) => setAdminNewAppointmentDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="adminNewAppointmentTime" className="block text-sm font-semibold text-gray-700 mb-1">Saat</label>
                      <input
                        type="time"
                        id="adminNewAppointmentTime"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={adminNewAppointmentTime}
                        onChange={(e) => setAdminNewAppointmentTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="adminNewServiceId" className="block text-sm font-semibold text-gray-700 mb-1">Servis Seçimi</label>
                    {services.length === 0 ? (
                      <p className="text-red-500">Servis bulunamadı. Lütfen önce servis ekleyin.</p>
                    ) : (
                      <select
                        id="adminNewServiceId"
                        className="mt-1 block w-full pl-4 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                        value={adminNewServiceId || ''}
                        onChange={(e) => setAdminNewServiceId(Number(e.target.value))}
                        required
                      >
                        {services.map((service) => (
                          <option key={service.servisID} value={service.servisID}>
                            {service.servisAdi} ({
                                // varsayilanUcret null/undefined veya sayısal değilse "Ücret Bilinmiyor" göster
                                (typeof service.varsayilanUcret === 'number' && !isNaN(service.varsayilanUcret))
                                    ? service.varsayilanUcret.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                                    : 'Ücret Bilinmiyor'
                            })
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label htmlFor="adminNewAppointmentAciklama" className="block text-sm font-semibold text-gray-700 mb-1">Açıklama (İsteğe Bağlı)</label>
                    <textarea
                      id="adminNewAppointmentAciklama"
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={adminNewAppointmentAciklama}
                      onChange={(e) => setAdminNewAppointmentAciklama(e.target.value)}
                      placeholder="Ek açıklamalar"
                      rows={2}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                    disabled={adminLoading || services.length === 0}
                  >
                    {adminLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Randevu Ekle'}
                  </button>
                </form>
              </div>

              {/* Randevu Yönetimi Listesi */}
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Randevu Listesi</h3>
                {appointments.length === 0 ? (
                  <p className="text-gray-600">Henüz randevu bulunmamaktadır.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servis</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ücret</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                          <tr key={appointment.randevuID}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.musteriAdi} {appointment.musteriSoyad}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.musteriTelefon}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(appointment.randevuZamani).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.servis}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {
                                    (typeof appointment.ucret === 'number' && !isNaN(appointment.ucret))
                                        ? appointment.ucret.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                                        : 'Ücret Bilinmiyor'
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    appointment.tamamlandimi ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {appointment.tamamlandimi ? 'Tamamlandı' : 'Beklemede'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDeleteAppointment(appointment.randevuID)}
                                className="text-red-600 hover:text-red-900 transition"
                              >
                                Sil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Servis Yönetimi */}
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 lg:col-span-2">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Servis Yönetimi</h3>
                
                {/* Servis Ekleme Formu */}
                <form onSubmit={handleAddService} className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                    <h4 className="text-lg font-semibold text-gray-700">Yeni Servis Ekle</h4>
                    <div>
                        <label htmlFor="newServiceName" className="block text-sm font-medium text-gray-700">Servis Adı</label>
                        <input
                            type="text"
                            id="newServiceName"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                            placeholder="Örn: Saç Kesimi"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="newServicePrice" className="block text-sm font-medium text-gray-700">Varsayılan Ücret (TL)</label>
                        <input
                            type="number"
                            id="newServicePrice"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={newServicePrice}
                            onChange={(e) => setNewServicePrice(e.target.value)}
                            placeholder="Örn: 150"
                            step="0.01"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                        disabled={adminLoading}
                    >
                        {adminLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Servis Ekle'}
                    </button>
                </form>

                {/* Servis Listesi */}
                {services.length === 0 ? (
                  <p className="text-gray-600">Henüz tanımlanmış servis bulunmamaktadır.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servis ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servis Adı</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ücret</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {services.map((service) => (
                          <tr key={service.servisID}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.servisID}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.servisAdi}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {
                                    (typeof service.varsayilanUcret === 'number' && !isNaN(service.varsayilanUcret))
                                        ? service.varsayilanUcret.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                                        : 'Ücret Bilinmiyor'
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDeleteService(service.servisID)}
                                className="text-red-600 hover:text-red-900 transition"
                              >
                                Sil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* İhtiyaç Yönetimi */}
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 lg:col-span-2">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">İhtiyaç Yönetimi</h3>
                
                {/* İhtiyaç Ekleme Formu */}
                <form onSubmit={handleAddNeed} className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                    <h4 className="text-lg font-semibold text-gray-700">Yeni İhtiyaç Ekle</h4>
                    <div>
                        <label htmlFor="newNeedName" className="block text-sm font-medium text-gray-700">İhtiyaç Adı</label>
                        <input
                            type="text"
                            id="newNeedName"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={newNeedName}
                            onChange={(e) => setNewNeedName(e.target.value)}
                            placeholder="Örn: Şampuan"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="newNeedAmount" className="block text-sm font-medium text-gray-700">Miktar</label>
                            <input
                                type="number"
                                id="newNeedAmount"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={newNeedAmount}
                                onChange={(e) => setNewNeedAmount(parseInt(e.target.value) || 1)}
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="newNeedUnitPrice" className="block text-sm font-medium text-gray-700">Birim Fiyat (TL)</label>
                            <input
                                type="number"
                                id="newNeedUnitPrice"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={newNeedUnitPrice}
                                onChange={(e) => setNewNeedUnitPrice(e.target.value)}
                                placeholder="Örn: 50.00"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                        disabled={adminLoading}
                    >
                        {adminLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'İhtiyaç Ekle'}
                    </button>
                </form>

                {/* İhtiyaç Listesi */}
                {needs.length === 0 ? (
                  <p className="text-gray-600">Henüz tanımlanmış ihtiyaç bulunmamaktadır.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İhtiyaç Adı</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birim Fiyat</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Fiyat</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {needs.map((need) => (
                          <tr key={need.ihtiyacID}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{need.ad}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{need.miktar}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {
                                    (typeof need.birimFiyat === 'number' && !isNaN(need.birimFiyat))
                                        ? need.birimFiyat.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                                        : 'Ücret Bilinmiyor'
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {
                                    (typeof need.toplamFiyat === 'number' && !isNaN(need.toplamFiyat))
                                        ? need.toplamFiyat.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                                        : 'Ücret Bilinmiyor'
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(need.createdAt).toLocaleString('tr-TR', { dateStyle: 'short' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDeleteNeed(need.ihtiyacID)}
                                className="text-red-600 hover:text-red-900 transition"
                              >
                                Sil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        navigate('/');
        return null;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
}

export default App;
