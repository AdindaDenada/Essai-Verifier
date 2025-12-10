import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  History,
  LogOut,
  Search, 
  ArrowUpDown,
  MoreVertical,
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import './riwayatnilai.css';

export default function RiwayatNilai() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState('riwayat');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const [essayHistory, setEssayHistory] = useState([]);
  const [filteredEssays, setFilteredEssays] = useState([]);

  // -------------------------------------------------------
  // GET DATA DARI FIRESTORE
  // -------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const q = query(
          collection(db, "essay_submissions"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        const list = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,

            // FIELD mahasiswa tetap ada, tidak dihapus
            mahasiswa: data.mahasiswa ?? "-",

            date: data.createdAt?.toDate().toLocaleDateString("id-ID"),
            timestamp: data.createdAt?.toDate().getTime(),

            score: data.aiResult?.skor ?? data.skor ?? "-",

            honestyPercentage: 
              data.aiResult?.persentase_kebohongan ??
              data.persentase_kebohongan ??
              null,

            status:
              data.aiResult?.status_lolos ??
              data.status_lolos ??
              data.aiResult?.status ??
              data.status ??
              "-",

            statusText:
              data.aiResult?.status_lolos ??
              data.status_lolos ??
              data.aiResult?.status ??
              data.status ??
              "-",
          };
        });

        setEssayHistory(list);
        setFilteredEssays(list);
      } catch (err) {
        console.error("Firestore Error:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/mahasiswa/dashboard') {
      setActiveMenu('dasbor');
    } else if (path === '/mahasiswa/riwayat-nilai') {
      setActiveMenu('riwayat');
    }
  }, [location.pathname]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = essayHistory.filter(e => e.title.toLowerCase().includes(q));
    setFilteredEssays(filtered);
  }, [searchQuery, essayHistory]);

  const getHonestyColor = (percentage) => {
    if (percentage === null) return 'gray';
    if (percentage <= 20) return 'green';
    if (percentage <= 40) return 'yellow';
    return 'red';
  };

  const handleViewDetail = (essayId) => {
    navigate(`/mahasiswa/detail-nilai/${essayId}`);
  };

  const handleNavigation = (menu, route) => {
    setActiveMenu(menu);
    navigate(route);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      navigate('/login');
    }
  };

  const handleSortToggle = () => {
    const sorted = [...filteredEssays].sort((a, b) => {
      return sortNewestFirst ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });
    setFilteredEssays(sorted);
    setSortNewestFirst(!sortNewestFirst);
  };

  return (
    <div className="riwayat-nilai-container">

      {/* SIDEBAR */}
      <aside className="riwayat-nilai-sidebar">
        <div className="riwayat-nilai-logo">
          <h1 className="riwayat-nilai-logo-text">Essay Verifier</h1>
        </div>

        <nav className="riwayat-nilai-nav">
          <button
            className={`riwayat-nilai-nav-item ${activeMenu === 'dasbor' ? 'active' : ''}`}
            onClick={() => handleNavigation('dasbor', '/mahasiswa/dashboard')}
          >
            <LayoutDashboard className="riwayat-nilai-nav-icon" />
            <span>Dasbor</span>
          </button>

          <button
            className={`riwayat-nilai-nav-item ${activeMenu === 'riwayat' ? 'active' : ''}`}
            onClick={() => handleNavigation('riwayat', '/mahasiswa/riwayat-nilai')}
          >
            <History className="riwayat-nilai-nav-icon" />
            <span>Riwayat Nilai Esai</span>
          </button>
        </nav>

        <button className="riwayat-nilai-logout" onClick={handleLogout}>
          <LogOut className="riwayat-nilai-nav-icon" />
          <span>Keluar</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="riwayat-nilai-main">
        <div className="riwayat-nilai-header">
          <div>
            <h1 className="riwayat-nilai-title">Riwayat Nilai Esai</h1>
            <p className="riwayat-nilai-subtitle">
              Lihat semua esai yang telah Anda kerjakan di bawah ini.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="riwayat-nilai-toolbar">
          <div className="riwayat-nilai-search-wrapper">
            <Search className="riwayat-nilai-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul esai..."
              className="riwayat-nilai-search-input"
            />
          </div>

          <div className="riwayat-nilai-toolbar-buttons">
            <button className="riwayat-nilai-sort-btn" onClick={handleSortToggle}>
              <ArrowUpDown className="riwayat-nilai-btn-icon" />
              Urutkan Tanggal
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="riwayat-nilai-table-container">
          <table className="riwayat-nilai-table">
            <thead>
              <tr>
                <th>JUDUL ESAI</th>

                {/* ❌ KOLUMN MAHASISWA DIHAPUS */}

                <th>TANGGAL</th>
                <th>NILAI</th>
                <th>PERSENTASE KEBOHONGAN</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredEssays.map((essay) => (
                <tr key={essay.id}>
                  <td className="riwayat-nilai-cell-title">{essay.title}</td>

                  {/* ❌ BAGIAN NAMA MAHASISWA DIHAPUS */}

                  <td>{essay.date}</td>
                  <td>{essay.score ?? "-"}</td>

                  <td>
                    {essay.honestyPercentage !== null ? (
                      <div className="riwayat-nilai-honesty-bar">
                        <div 
                          className={`riwayat-nilai-honesty-fill ${getHonestyColor(essay.honestyPercentage)}`}
                          style={{ width: `${essay.honestyPercentage}%` }}
                        ></div>
                        <span className="riwayat-nilai-honesty-text">
                          {essay.honestyPercentage}%
                        </span>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>

                  <td>
                    <span className={`riwayat-nilai-status ${essay.status}`}>
                      {essay.statusText}
                    </span>
                  </td>

                  <td>
                    <button 
                      className="riwayat-nilai-action-btn"
                      onClick={() => handleViewDetail(essay.id)}
                    >
                      <MoreVertical className="riwayat-nilai-action-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <div className="riwayat-nilai-pagination">
          <span className="riwayat-nilai-pagination-info">
            Menampilkan {filteredEssays.length} hasil
          </span>
        </div>

      </main>
    </div>
  );
}
