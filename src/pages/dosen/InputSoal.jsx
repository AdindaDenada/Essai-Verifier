// ==========================
// InputSoal.jsx (SUDAH DISESUAIKAN)
// ==========================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import './InputSoal.css';

const InputSoal = () => {
  const navigate = useNavigate();

  const [judulSoal, setJudulSoal] = useState('');
  const [teksPernyataan, setTeksPernyataan] = useState('');
  const [tanggalBatas, setTanggalBatas] = useState('');
  const [jamBatas, setJamBatas] = useState('');
  const [kriteria, setKriteria] = useState([{ nama: '', bobot: '' }]);

  const [dosenData, setDosenData] = useState({ fullName: '', email: '' });

  // Ambil data dosen yang login
  useEffect(() => {
    const fetchDosenData = async () => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDosenData({
            fullName: data.fullName || '',
            email: data.email || auth.currentUser.email
          });
        }
      }
    };
    fetchDosenData();
  }, []);

  // Handler kriteria
  const handleTambahKriteria = () => {
    setKriteria([...kriteria, { nama: '', bobot: '' }]);
  };

  const handleHapusKriteria = (index) => {
    setKriteria(kriteria.filter((_, i) => i !== index));
  };

  const handleKriteriaChange = (index, field, value) => {
    const newList = [...kriteria];
    newList[index][field] = value;
    setKriteria(newList);
  };

  // Simpan soal
  const handleSimpan = async () => {
    if (!judulSoal || !teksPernyataan || !tanggalBatas || !jamBatas) {
      alert('Mohon lengkapi semua field.');
      return;
    }

    try {
      await addDoc(collection(db, 'soalEssai'), {
        judulSoal,
        teksPernyataan,
        tanggalBatas,
        jamBatas,
        kriteria,
        dosenId: auth.currentUser.uid,
        dosenNama: dosenData.fullName,
        timestamp: serverTimestamp()
      });

      alert('Soal berhasil disimpan!');
      navigate('/dosen/dashboard');
    } catch (err) {
      console.error('Error menyimpan soal:', err);
      alert('Gagal menyimpan soal.');
    }
  };

  const handleBatal = () => {
    if (window.confirm('Batalkan pembuatan soal? Data akan hilang.')) {
      navigate('/dosen/dashboard');
    }
  };

  return (
    <div className="input-soal-container">

      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="avatar-placeholder">A</div>
          <div className="user-details">
            <h3>{dosenData.fullName || 'Dosen'}</h3>
            <p>Dosen</p>
          </div>
        </div>

        <nav>
          <div className="nav-item" onClick={() => navigate('/dosen/dashboard')}>Dashboard</div>
          <div className="nav-item active" onClick={() => navigate('/dosen/input-soal')}>Buat Soal</div>
          <div className="nav-item" onClick={() => navigate('/dosen/riwayat-nilai')}>Nilai</div>
        </nav>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate('/dosen/dashboard')}>Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span className="active">Buat Soal Baru</span>
        </div>

        <h1>Buat Soal Esai Baru</h1>

        <div className="form-section">
          <h2>Informasi Dasar Soal</h2>

          <div className="form-group">
            <label>Judul Soal</label>
            <input
              type="text"
              value={judulSoal}
              onChange={(e) => setJudulSoal(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Teks Pertanyaan Esai</label>
            <textarea
              value={teksPernyataan}
              onChange={(e) => setTeksPernyataan(e.target.value)}
              className="form-textarea"
            />
          </div>

          <h2>Pengaturan Waktu</h2>

          <div className="time-inputs">
            <div className="form-group half">
              <label>Tanggal Batas Waktu</label>
              <input
                type="date"
                value={tanggalBatas}
                onChange={(e) => setTanggalBatas(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group half">
              <label>Jam Batas Waktu</label>
              <input
                type="time"
                value={jamBatas}
                onChange={(e) => setJamBatas(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="criteria-section">
            <div className="criteria-header">
              <h2>Kriteria Penilaian</h2>
              <button onClick={handleTambahKriteria} className="btn-add-criteria">+ Tambah Kriteria</button>
            </div>

            {kriteria.map((item, index) => (
              <div key={index} className="criteria-row">
                <input
                  type="text"
                  placeholder="Nama"
                  value={item.nama}
                  onChange={(e) => handleKriteriaChange(index, 'nama', e.target.value)}
                  className="criteria-input"
                />

                <div className="criteria-bobot-wrapper">
                  <input
                    type="number"
                    placeholder="Bobot"
                    value={item.bobot}
                    onChange={(e) => handleKriteriaChange(index, 'bobot', e.target.value)}
                    className="criteria-bobot"
                  />
                  <span>%</span>
                </div>

                <button onClick={() => handleHapusKriteria(index)} className="btn-delete">Hapus</button>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button onClick={handleBatal} className="btn-cancel">Batal</button>
            <button onClick={handleSimpan} className="btn-save">Simpan Soal</button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default InputSoal;
