import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, LogOut, Users, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import './AddUser.css';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [activeMenu, setActiveMenu] = useState('add-user');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      alert('Semua field harus diisi!');
      return;
    }

    try {
      // 1. Buat akun di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Simpan data tambahan di Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp()
      });

      alert(`Akun ${formData.fullName} berhasil ditambahkan sebagai ${formData.role}!`);

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: ''
      });

    } catch (error) {
      console.error('Error tambah user:', error);
      alert(error.message);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan?')) {
      navigate('/admin/dashboard');
    }
  };

  const handleNavigation = (menu, route) => {
    setActiveMenu(menu);
    navigate(route);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      navigate('/login');
    }
  };

  return (
    <div className="add-user-container">
      {/* Sidebar */}
      <aside className="add-user-sidebar">
        <div className="add-user-logo">
          <Users className="add-user-logo-icon" />
          <h1 className="add-user-logo-text">Admin Panel</h1>
        </div>

        <nav className="add-user-nav">
          <button
            className={`add-user-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('dashboard', '/admin/dashboard')}
          >
            <LayoutDashboard className="add-user-nav-icon" />
            <span>Dashboard</span>
          </button>
          
          <button
            className={`add-user-nav-item ${activeMenu === 'add-user' ? 'active' : ''}`}
            onClick={() => handleNavigation('add-user', '/admin/add-user')}
          >
            <UserPlus className="add-user-nav-icon" />
            <span>Tambah Pengguna</span>
          </button>
        </nav>

        <button className="add-user-logout" onClick={handleLogout}>
          <LogOut className="add-user-nav-icon" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="add-user-main">
        <div className="add-user-form-wrapper">
          <div className="add-user-form-header">
            <h1>Tambah Akun Pengguna Baru</h1>
            <p className="add-user-form-subtitle">
              Isi detail di bawah ini untuk membuat akun baru
            </p>
          </div>

          <form className="add-user-form" onSubmit={handleSubmit}>
            {/* Nama Lengkap */}
            <div className="add-user-form-group">
              <label htmlFor="fullName">Nama Lengkap</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            {/* Email */}
            <div className="add-user-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contoh@email.com"
                required
              />
            </div>

            {/* Password */}
            <div className="add-user-form-group">
              <label htmlFor="password">Kata Sandi</label>
              <div className="add-user-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan kata sandi"
                  required
                />
                <button
                  type="button"
                  className="add-user-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="add-user-form-group">
              <label htmlFor="role">Peran</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Pilih peran</option>
                <option value="admin">Admin</option>
                <option value="dosen">Dosen</option>
                <option value="mahasiswa">Mahasiswa</option>
              </select>
            </div>

            {/* Actions */}
            <div className="add-user-form-actions">
              <button
                type="button"
                className="add-user-btn-cancel"
                onClick={handleCancel}
              >
                Batal
              </button>
              <button type="submit" className="add-user-btn-submit">
                <span className="add-user-plus-icon">+</span> Tambahkan Akun
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddUser;
