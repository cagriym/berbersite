import React, { useEffect, useState } from 'react';

interface Appointment {
  randevuID: number;
  randevuZamani: string;
  ucret: number;
  tamamlandimi: boolean;
}

interface Need {
  ihtiyacID: number;
  toplamFiyat: number;
  createdAt: string;
}

const API_BASE_URL = 'https://oktay-sac-tasarim1.azurewebsites.net/api';

function getHeaders() {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [aRes, nRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Appointments`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/Needs`, { headers: getHeaders() }),
        ]);
        if (!aRes.ok) throw new Error(await aRes.text());
        if (!nRes.ok) throw new Error(await nRes.text());
        setAppointments(await aRes.json());
        setNeeds(await nRes.json());
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hesaplamalar
  const totalIncome = appointments.filter(a => a.tamamlandimi).reduce((sum, a) => sum + (a.ucret || 0), 0);
  const totalExpense = needs.reduce((sum, n) => sum + (n.toplamFiyat || 0), 0);
  const netBalance = totalIncome - totalExpense;

  // Son 6 ay için aylık gelir/gider
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().slice(0, 7); // YYYY-MM
  });
  const incomeByMonth = months.map(m =>
    appointments.filter(a => a.tamamlandimi && a.randevuZamani.slice(0, 7) === m).reduce((sum, a) => sum + (a.ucret || 0), 0)
  );
  const expenseByMonth = months.map(m =>
    needs.filter(n => n.createdAt.slice(0, 7) === m).reduce((sum, n) => sum + (n.toplamFiyat || 0), 0)
  );

  return (
    <div className="container-fluid mt-4">
      <div className="jumbotron">
        <h1 className="display-4">Admin Paneline Hoş Geldiniz!</h1>
        <p className="lead">
          Bu panel üzerinden sitenin temel verilerini yönetebilirsiniz.
        </p>
        <hr className="my-4" />
        <p>
          Sol taraftaki menüyü kullanarak <strong>Randevuları</strong>, <strong>Müşterileri</strong> ve <strong>Müşteri İhtiyaçlarını</strong> görüntüleyebilirsiniz.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Mali Durum</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Yükleniyor...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-100 p-6 rounded shadow text-center">
                <div className="text-lg font-semibold text-green-700">Toplam Gelir</div>
                <div className="text-2xl font-bold">₺{totalIncome.toLocaleString('tr-TR')}</div>
              </div>
              <div className="bg-red-100 p-6 rounded shadow text-center">
                <div className="text-lg font-semibold text-red-700">Toplam Gider</div>
                <div className="text-2xl font-bold">₺{totalExpense.toLocaleString('tr-TR')}</div>
              </div>
              <div className="bg-blue-100 p-6 rounded shadow text-center">
                <div className="text-lg font-semibold text-blue-700">Net Bakiye</div>
                <div className="text-2xl font-bold">₺{netBalance.toLocaleString('tr-TR')}</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <div className="text-lg font-semibold mb-2">Aylık Gelir/Gider Grafiği</div>
              <div className="h-64 flex items-end gap-2 w-full overflow-x-auto">
                {/* Basit SVG bar chart */}
                <svg width={months.length * 60} height="220">
                  {/* Axis */}
                  <line x1="40" y1="10" x2="40" y2="200" stroke="#888" strokeWidth="2" />
                  <line x1="40" y1="200" x2={months.length * 60} y2="200" stroke="#888" strokeWidth="2" />
                  {/* Bars */}
                  {months.map((m, i) => {
                    const max = Math.max(...incomeByMonth, ...expenseByMonth, 1);
                    const incomeH = (incomeByMonth[i] / max) * 180;
                    const expenseH = (expenseByMonth[i] / max) * 180;
                    return (
                      <g key={m}>
                        {/* Income bar */}
                        <rect x={50 + i * 60} y={200 - incomeH} width="20" height={incomeH} fill="#34d399" />
                        {/* Expense bar */}
                        <rect x={75 + i * 60} y={200 - expenseH} width="20" height={expenseH} fill="#f87171" />
                        {/* Month label */}
                        <text x={60 + i * 60} y={215} textAnchor="middle" fontSize="12">{m.slice(5, 7) + '/' + m.slice(2, 4)}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="inline-block w-4 h-4 bg-green-400 mr-1 align-middle"></span> Gelir
                <span className="inline-block w-4 h-4 bg-red-400 ml-4 mr-1 align-middle"></span> Gider
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 