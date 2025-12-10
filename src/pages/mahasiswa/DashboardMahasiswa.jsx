import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, 
  History, 
  LogOut,
  FileText,
  Calendar
} from 'lucide-react';
import { auth, db } from "../../firebase";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import './DashboardMahasiswa.css';

export default function DashboardMahasiswa() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dasbor");
  const [activeTab, setActiveTab] = useState("belum");
  const [userData, setUserData] = useState({ fullName: '', email: '', uid: '' });
  const [essayTasks, setEssayTasks] = useState([]);
  const [riwayat, setRiwayat] = useState([]);

  // Ambil data user yang login
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            fullName: data.fullName || '',
            email: data.email || auth.currentUser.email,
            uid: uid
          });
        }
      }
    };
    fetchUserData();
  }, []);

  // Ambil semua soal dari dosen
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "soalEssai"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().judulSoal,
        category: doc.data().kriteria?.map(k => k.nama).join(', ') || 'Umum',
        deadline: `${doc.data().tanggalBatas} ${doc.data().jamBatas}`,
        ...doc.data()
      }));
      setEssayTasks(data);
    });
    return () => unsub();
  }, []);

  // Ambil riwayat esai mahasiswa
  useEffect(() => {
    if (!userData.uid) return;
    const unsub = onSnapshot(collection(db, "riwayatEssai"), (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.uid === userData.uid);
      setRiwayat(data);
    });
    return () => unsub();
  }, [userData.uid]);

  // Hitung soal berdasarkan status mahasiswa
  const sudahDikerjakan = essayTasks.filter(task =>
    riwayat.some(r => r.essayId === task.id)
  );

  const belumDikerjakan = essayTasks.filter(task =>
    !riwayat.some(r => r.essayId === task.id)
  );

  // Mulai kerjakan esai
  const handleStartEssay = async (task) => {
    // Tambahkan riwayat esai untuk mahasiswa ini
    await addDoc(collection(db, "riwayatEssai"), {
      uid: userData.uid,
      essayId: task.id,
      title: task.title,
      category: task.category,
      deadline: task.deadline,
      status: "selesai",
      timestamp: serverTimestamp()
    });
    navigate('/mahasiswa/kerjakan-essai', { state: { taskId: task.id } });
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-mhs-container">
      <aside className="dashboard-mhs-sidebar">
        <div className="dashboard-mhs-logo">
          <h1 className="dashboard-mhs-logo-text">Essay Verifier</h1>
        </div>

        <nav className="dashboard-mhs-nav">
          <button 
            className={`dashboard-mhs-nav-item ${activeMenu === 'dasbor' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('dasbor'); navigate('/mahasiswa/dashboard'); }}
          >
            <LayoutDashboard className="dashboard-mhs-nav-icon" />
            <span>Dasbor</span>
          </button>

          <button 
            className={`dashboard-mhs-nav-item ${activeMenu === 'riwayat' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('riwayat'); navigate('/mahasiswa/riwayat-nilai'); }}
          >
            <History className="dashboard-mhs-nav-icon" />
            <span>Riwayat Nilai Esai</span>
          </button>
        </nav>

        <button className="dashboard-mhs-logout" onClick={handleLogout}>
          <LogOut className="dashboard-mhs-nav-icon" />
          <span>Keluar</span>
        </button>
      </aside>

      <main className="dashboard-mhs-main">
        <header className="dashboard-mhs-header">
          <div className="dashboard-mhs-user-info">
            <span className="dashboard-mhs-user-name">{userData.fullName}</span>
            <span className="dashboard-mhs-user-email">{userData.email}</span>
          </div>
          <div className="dashboard-mhs-user-avatar">
            <FileText className="dashboard-mhs-avatar-icon" />
          </div>
        </header>

        <div className="dashboard-mhs-content">
          <div className="dashboard-mhs-content-left">
            <div className="dashboard-mhs-title-section">
              <h2 className="dashboard-mhs-title">Dasbor Soal Esai Saya</h2>
              <p className="dashboard-mhs-subtitle">
                Lihat dan kerjakan soal esai yang ditugaskan.
              </p>
            </div>

            <div className="dashboard-mhs-tabs">
              <button 
                className={`dashboard-mhs-tab ${activeTab === 'belum' ? 'active' : ''}`}
                onClick={() => setActiveTab('belum')}
              >
                Belum Dikerjakan
              </button>

              <button 
                className={`dashboard-mhs-tab ${activeTab === 'sudah' ? 'active' : ''}`}
                onClick={() => setActiveTab('sudah')}
              >
                Sudah Dikerjakan
              </button>
            </div>

            <div className="dashboard-mhs-cards">
              {(activeTab === "belum" ? belumDikerjakan : sudahDikerjakan).map((task) => (
                <div key={task.id} className="dashboard-mhs-card">
                  <div className="dashboard-mhs-card-content">
                    <span className="dashboard-mhs-card-category">{task.category}</span>
                    <h3 className="dashboard-mhs-card-title">{task.title}</h3>
                    <div className="dashboard-mhs-card-deadline">
                      <Calendar className="dashboard-mhs-card-icon" />
                      <span>Tenggat: {task.deadline}</span>
                    </div>

                    {activeTab === "belum" ? (
                      <button className="dashboard-mhs-card-btn"
                        onClick={() => handleStartEssay(task)}
                      >
                        Mulai Kerjakan
                      </button>
                    ) : (
                      <button className="dashboard-mhs-card-btn" disabled>
                        Sudah Dikerjakan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="dashboard-mhs-right-sidebar">
            <div className="dashboard-mhs-summary-card">
              <h3 className="dashboard-mhs-summary-title">Ringkasan & Akses Cepat</h3>

              <div className="dashboard-mhs-summary-item">
                <span className="dashboard-mhs-summary-label">Esai Belum Dikerjakan</span>
                <span className="dashboard-mhs-summary-value blue">{belumDikerjakan.length}</span>
              </div>

              <div className="dashboard-mhs-summary-item">
                <span className="dashboard-mhs-summary-label">Esai Selesai</span>
                <span className="dashboard-mhs-summary-value green">{sudahDikerjakan.length}</span>
              </div>
            </div>

            <div className="dashboard-mhs-history-card">
              <h3 className="dashboard-mhs-history-title">Riwayat Nilai Esai</h3>
              <p className="dashboard-mhs-history-text">
                Lihat semua nilai esai yang telah Anda kumpulkan.
              </p>
              <button 
                className="dashboard-mhs-history-btn"
                onClick={() => navigate('/mahasiswa/riwayat-nilai')}
              >
                <History className="dashboard-mhs-history-icon" />
                Lihat Riwayat
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
