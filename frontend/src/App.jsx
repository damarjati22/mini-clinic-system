import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import DashboardAdmin from './admin/dashboardadmin.jsx';
import DashboardDokter from './dokter/dashboarddokter.jsx';
import DashboardPetugas from './petugaspendaftaran/dashboardpetugas.jsx';
import PatientManagement from './petugaspendaftaran/PatientManagement.jsx';
import VisitManagement from './petugaspendaftaran/VisitManagement.jsx';
import QueueManagement from './petugaspendaftaran/queueManagement.jsx';
import DashboardLayout from './DashboardLayout.jsx';

function App() {
  const [backendMessage, setBackendMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }

    fetch('http://localhost:5000/')
      .then((res) => res.json())
      .then((data) => {
        setBackendMessage(data.message);
        setLoading(false);
      })
      .catch(() => {
        setBackendMessage('Gagal terhubung ke backend.');
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('home');
  };

  if (!user || currentView === 'login') {
    if (currentView === 'login') {
      return (
        <Login 
          onBack={() => setCurrentView('home')} 
          onLoginSuccess={(userData) => {
            setUser(userData);
            setCurrentView('dashboard');
          }} 
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mini Clinic System</h1>
            <p className="text-sm text-slate-500 mt-1">Sistem Informasi Manajemen Klinik Pratama</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-left space-y-6">
            <p className="text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              ✅ {backendMessage}
            </p>
            <button
              onClick={() => setCurrentView('login')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg transition"
            >
              Masuk ke Halaman Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  let content = null;

  if (currentView === 'patients') {
    content = <PatientManagement user={user} />;
  } else if (currentView === 'visits') {
    content = <VisitManagement user={user} />;
  } else if (currentView === 'queue') {
    content = <QueueManagement user={user} />;
  } else {
    if (user.role === 'Administrator') {
      content = <DashboardAdmin user={user} onLogout={handleLogout} onNavigate={(view) => setCurrentView(view)} />;
    } else if (user.role === 'Dokter') {
      content = <DashboardDokter user={user} onLogout={handleLogout} />;
    } else if (user.role === 'Petugas Pendaftaran') {
      content = <DashboardPetugas user={user} onLogout={handleLogout} onNavigate={(view) => setCurrentView(view)} />;
    }
  }

  return (
    <DashboardLayout 
      user={user} 
      currentView={currentView} 
      onNavigate={(view) => setCurrentView(view)} 
      onLogout={handleLogout}
    >
      {content}
    </DashboardLayout>
  );
}

export default App;