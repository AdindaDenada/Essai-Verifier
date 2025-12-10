import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import Halaman Umum
import Awal from './pages/awal';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgotPassword'; // <- tambahkan ini

// 2. Import Halaman Admin
import DasborAdmin from './pages/admin/DasborAdmin';
import AddUser from './pages/admin/AddUser';

// 3. Import Halaman Dosen
import DasborDosen from './pages/dosen/DasborDosen';
import InputSoal from './pages/dosen/InputSoal';
import RiwayatNilaiMahasiswaAdmin from './pages/dosen/ListNilaiMahasiswa'; 

// 4. Import Halaman Mahasiswa
import DashboardMahasiswa from './pages/mahasiswa/DashboardMahasiswa'; 
import KerjakanEssai from './pages/mahasiswa/KerjakanEssai'; 
import RiwayatNilaiMhs from './pages/mahasiswa/riwayatnilai'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* --- ROUTE UMUM --- */}
        <Route path="/" element={<Awal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- ROUTE ADMIN --- */}
        <Route path="/admin/dashboard" element={<DasborAdmin />} />
        <Route path="/admin/add-user" element={<AddUser />} />

        {/* --- ROUTE DOSEN --- */}
        <Route path="/dosen/dashboard" element={<DasborDosen />} />
        <Route path="/dosen/input-soal" element={<InputSoal />} />
        <Route path="/dosen/riwayat-nilai" element={<RiwayatNilaiMahasiswaAdmin />} />

        {/* --- ROUTE MAHASISWA --- */}
        <Route path="/mahasiswa/dashboard" element={<DashboardMahasiswa />} />
        <Route path="/mahasiswa/kerjakan-essai" element={<KerjakanEssai />} />
        <Route path="/mahasiswa/riwayat-nilai" element={<RiwayatNilaiMhs />} />
      </Routes>
    </Router>
  );
}

export default App;
