import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Shield, Eye, EyeOff } from 'lucide-react';
import './register.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'mahasiswa' // semua registrasi otomatis mahasiswa
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register data:', formData);

    try {
      // 1. Registrasi user di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Simpan data tambahan di Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: 'mahasiswa',  // role otomatis mahasiswa
        createdAt: new Date()
      });

      // 3. Notifikasi & redirect
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');

    } catch (error) {
      console.error('Error registrasi:', error);
      alert(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          {/* Kosong atau logo */}
        </div>

        <h1 className="register-title">Selamat Datang!</h1>
        <p className="register-subtitle">
          Mulai deteksi kejujuran akademik dengan mudah.
        </p>

        <div className="register-form">
          <div className="register-form-group">
            <label className="register-label">Nama Lengkap</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap Anda"
              className="register-input"
              required
            />
          </div>

          <div className="register-form-group">
            <label className="register-label">Alamat Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
              className="register-input"
              required
            />
          </div>

          {/* Pilihan role dihapus */}

          <div className="register-form-group">
            <label className="register-label">Kata Sandi</label>
            <div className="register-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi Anda"
                className="register-input"
                required
              />
              <button
                type="button"
                className="register-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="register-eye-icon" /> : <Eye className="register-eye-icon" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="register-btn"
            onClick={handleSubmit}
          >
            Daftar Sekarang
          </button>

          <p className="register-login-text">
            Sudah memiliki akun?{' '}
            <button 
              type="button"
              className="register-login-link"
              onClick={() => navigate('/login')}
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
