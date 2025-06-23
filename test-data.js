// Test verilerini API'ye gönderme script'i
const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net';

async function addTestData() {
    try {
        console.log('Test verileri ekleniyor...');
        
        const response = await fetch(`${API_BASE_URL}/api/Appointments/add-test-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Test verileri başarıyla eklendi:', result);
            
            // Eklenen verileri göster
            console.log(`📊 Eklenen veriler:`);
            console.log(`   - Müşteri sayısı: ${result.musteriSayisi}`);
            console.log(`   - Randevu sayısı: ${result.randevuSayisi}`);
            console.log(`   - İhtiyaç sayısı: ${result.ihtiyacSayisi}`);
        } else {
            const error = await response.text();
            console.error('❌ Hata:', error);
        }
    } catch (error) {
        console.error('❌ Bağlantı hatası:', error);
    }
}

// Test verilerini ekle
addTestData(); 