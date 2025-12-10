import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, GraduationCap, User, UserCog, Eye, EyeOff } from 'lucide-react';
import './login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'dosen' // default role
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
    console.log('Login data:', formData);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const roleFromDb = userData.role;

        // Validasi role
        if (roleFromDb === formData.role) {
          // Navigasi sesuai role
          if (roleFromDb === 'dosen') navigate('/dosen/dashboard');
          else if (roleFromDb === 'mahasiswa') navigate('/mahasiswa/dashboard');
          else if (roleFromDb === 'admin') navigate('/admin/dashboard');
        } else {
          alert(`Login gagal: Anda tidak memiliki akses sebagai ${formData.role}`);
        }
      } else {
        alert('Data user tidak ditemukan di database.');
      }

    } catch (error) {
      console.error('Error login:', error);
      alert('Login gagal: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <Shield className="shield-icon" />
        </div>

        <h1 className="login-title">Selamat Datang Kembali</h1>
        <p className="login-subtitle">
          Login untuk mendeteksi plagiarisme dan originalitas esai dengan cepat.
        </p>

        <div className="role-section">
          <label className="role-label">Pilih peran Anda</label>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${formData.role === 'dosen' ? 'role-btn-active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'dosen' })}
            >
              <GraduationCap className="role-icon" />
              <span>Dosen</span>
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'mahasiswa' ? 'role-btn-active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'mahasiswa' })}
            >
              <User className="role-icon" />
              <span>Mahasiswa</span>
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'admin' ? 'role-btn-active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'admin' })}
            >
              <UserCog className="role-icon" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Masukkan email Anda"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <div className="password-header">
            <label className="form-label">Kata Sandi</label>
            <button 
              type="button"
              className="forgot-password"
              onClick={() => navigate('/forgot-password')}
            >
              Lupa Kata Sandi?
            </button>
          </div>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan kata sandi Anda"
              className="form-input"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          className="login-btn"
          onClick={handleSubmit}
        >
          Login
        </button>

        <p className="register-text">
          Belum punya akun? <button 
            type="button"
            className="register-link"
            onClick={() => navigate('/register')}
          >
            Registrasi
          </button>
        </p>
      </div>
    </div>
  );
}
