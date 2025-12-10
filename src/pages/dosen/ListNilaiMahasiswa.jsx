import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import './ListNilaiMahasiswa.css';

const ListNilaiMahasiswa = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [dataEsai, setDataEsai] = useState([]);
  const [dosenName, setDosenName] = useState('Loading...');
  const [dosenRole, setDosenRole] = useState('Dosen');

  // Modal Detail State
  const [activeDetail, setActiveDetail] = useState(null);

  // Ambil data dosen
  useEffect(() => {
    const fetchLoggedInDosen = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, 'users'), where('email', '==', user.email));
        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
          const data = doc.data();
          setDosenName(data.fullName || 'Dosen');
          setDosenRole(data.role || 'Dosen');
        });
      } catch (error) {
        console.log('Error ambil data dosen:', error);
      }
    };

    fetchLoggedInDosen();
  }, []);

  // Ambil data riwayatEssai
  useEffect(() => {
    const fetchData = async () => {
      try {
        const riwayatSnapshot = await getDocs(collection(db, 'riwayatEssai'));

        const data = [];
        riwayatSnapshot.forEach((doc) => {
          const item = doc.data();
          data.push({
            id: doc.id,
            nama: item.mahasiswa || 'Tidak diketahui',
            judul: item.title || '-',
            tanggal: item.timestamp
              ? new Date(item.timestamp.seconds * 1000).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : '-',
            nilai: item.skor || 0,
            kebohongan: item.persentase_kebohongan || 0,
            status: item.status || 'Tidak Lolos',
            timestamp: item.timestamp ? item.timestamp.seconds : 0,
            fileUrl: item.fileUrl || '',
            snippet: item.snippet || '',
            analisis: item.analisis || '',
          });
        });

        setDataEsai(data);
      } catch (error) {
        console.log('Error Firestore:', error);
      }
    };

    fetchData();
  }, []);

  const getProgressBarColor = (percentage) => {
    if (percentage === 0) return '#E5E7EB';
    if (percentage <= 20) return '#22C55E';
    if (percentage <= 50) return '#EAB308';
    return '#EF4444';
  };

  const getPercentageTextColor = (percentage) => {
    if (percentage === 0) return '#9CA3AF';
    if (percentage <= 20) return '#22C55E';
    if (percentage <= 50) return '#EAB308';
    return '#EF4444';
  };

  const filteredData = dataEsai.filter((item) =>
    item.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) =>
    sortNewest ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
  );

  const Icons = {
    Dashboard: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
      </svg>
    ),
    File: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    ),
    Users: () => (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
    ),
    Search: () => (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    ),
    Sort: () => (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
      </svg>
    ),
    Dots: () => (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 13a1 1 0 100-2 1 1 0 000 2zm0-6a1 1 0 100-2 1 1 0 000-2zm0 12a1 1 0 100-2 1 1 0 000-2z"></path>
      </svg>
    ),
  };

  return (
    <div className="container">

      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="avatar-placeholder">A</div>
          <div className="user-details">
            <h3>{dosenName}</h3>
            <p>{dosenRole}</p>
          </div>
        </div>

        <nav>
          <div className="nav-item" onClick={() => navigate('/dosen/dashboard')}>
            <Icons.Dashboard />
            <span>Dashboard</span>
          </div>

          <div className="nav-item" onClick={() => navigate('/dosen/input-soal')}>
            <Icons.File />
            <span>Buat Soal</span>
          </div>

          <div className="nav-item active">
            <Icons.Users />
            <span>Nilai</span>
          </div>
        </nav>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="page-header">
          <h1>Daftar Nilai Mahasiswa</h1>
          <p>Lihat semua esai yang telah mahasiswa kerjakan di bawah ini.</p>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrapper">
            <div className="search-icon"><Icons.Search /></div>
            <input
              type="text"
              placeholder="Cari berdasarkan judul esai..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button className="btn-filter" onClick={() => setSortNewest(!sortNewest)}>
              <Icons.Sort /> Urutkan ({sortNewest ? 'Terbaru' : 'Terlama'})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>NAMA</th>
                <th>JUDUL ESAI</th>
                <th>TANGGAL</th>
                <th>NILAI</th>
                <th>PERSENTASE KEBOHONGAN</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {sortedData.map((item) => (
                <tr key={item.id}>
                  <td className="row-title">{item.nama}</td>
                  <td className="row-title">{item.judul}</td>
                  <td className="row-date">{item.tanggal}</td>
                  <td className="row-score">{item.nilai}</td>

                  <td>
                    <div className="lie-container">
                      <span
                        className="progress-dot"
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getProgressBarColor(item.kebohongan),
                          display: item.kebohongan > 0 ? 'block' : 'none'
                        }}
                      ></span>

                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${item.kebohongan}%`,
                            backgroundColor: getProgressBarColor(item.kebohongan),
                          }}
                        ></div>
                      </div>

                      <span
                        className="percentage-text"
                        style={{ color: getPercentageTextColor(item.kebohongan) }}
                      >
                        {item.kebohongan > 0 ? `${item.kebohongan}%` : '-'}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        item.status === 'Lolos' ? 'status-selesai' : 'status-menunggu'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* TOMBOL DETAIL */}
                  <td>
                    <button className="btn-menu" onClick={() => setActiveDetail(item)}>
                      <Icons.Dots />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {activeDetail && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h2>Detail Esai</h2>

            <p><strong>Judul:</strong> {activeDetail.judul}</p>
            <p><strong>Nama Mahasiswa:</strong> {activeDetail.nama}</p>

            <p><strong>Analisis AI:</strong></p>
            <div className="analisis-box">
              {activeDetail.analisis || 'Tidak ada analisis.'}
            </div>

            {/* GANTI PREVIEW PDF MENJADI TEKS ESAI */}
            <p><strong>Isi Esai:</strong></p>
            <div className="essay-text-box">
              {activeDetail.snippet || 'Tidak ada teks esai.'}
            </div>

            {/* HAPUS DOWNLOAD PDF — sesuai permintaan */}

            <button className="btn-close" onClick={() => setActiveDetail(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListNilaiMahasiswa;
