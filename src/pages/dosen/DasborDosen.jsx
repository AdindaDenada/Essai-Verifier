import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DasborDosen.css';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const DasborDosen = () => {
  const navigate = useNavigate();
  const [dosen, setDosen] = useState({ nama: '', email: '' });

  // SOAL AKTIF (DIAMBIL DARI KOLEKSI soalEssai)
  const [soalAktif, setSoalAktif] = useState(0);

  // -----------------------------
  // GET DATA DOSEN LOGIN
  // -----------------------------
  useEffect(() => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return;

    const q = query(collection(db, 'users'), where('email', '==', userEmail));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0].data();
        setDosen({
          nama: doc.fullName,
          email: doc.email
        });
      }
    });

    return () => unsub();
  }, []);

  // ------------------------------------------------
  // 1. HITUNG SOAL AKTIF DARI KOLEKSI soalEssai
  // ------------------------------------------------
  useEffect(() => {
    if (!dosen.nama) return;

    const q = query(collection(db, 'soalEssai'), where('dosenNama', '==', dosen.nama));

    const unsub = onSnapshot(q, (snapshot) => {
      setSoalAktif(snapshot.size);
    });

    return () => unsub();
  }, [dosen.nama]);


  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      navigate('/login');
    }
  };

  return (
    <div className="dasbor-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="profile-section">
          <div className="profile-avatar">
            <span style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>
              {dosen.nama.charAt(0) || 'I'}
            </span>
          </div>
          <div className="profile-info">
            <h3>{dosen.nama || 'Dosen'}</h3>
            <p>Dosen</p>
          </div>
        </div>

        <nav className="nav-menu">
          <div className="nav-item active" onClick={() => navigate('/dosen/dashboard')}>
            <span>Dashboard</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/dosen/input-soal')}>
            <span>Buat Soal</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/dosen/riwayat-nilai')}>
            <span>Nilai</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout-item" onClick={handleLogout}>
            <span style={{ color: '#D97706' }}>Logout</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="welcome-section">
          <h1>Selamat Datang, {dosen.nama || 'Dosen'}</h1>
          <p>Berikut adalah ringkasan aktivitas terbaru Anda.</p>
        </div>

        {/* GRID: SOAL AKTIF + TOMBOL */}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '20px',
          marginTop: '20px'
        }}>
          
          {/* KOTAK SOAL AKTIF */}
          <div className="stat-card">
            <h3>Soal Aktif</h3>
            <div className="stat-value">{soalAktif}</div>
          </div>

          {/* TOMBOL NAVIGASI */}
          <div style={{
            width: '100%',
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => navigate('/dosen/input-soal')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563EB',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Buat Soal
            </button>

            <button
              onClick={() => navigate('/dosen/riwayat-nilai')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#059669',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Daftar Nilai Mahasiswa
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DasborDosen;
