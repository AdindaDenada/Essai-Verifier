import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import './forgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Silakan masukkan email Anda.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert('Email reset password telah dikirim. Silakan cek inbox atau spam Gmail Anda.');
      navigate('/login'); // kembali ke halaman login
    } catch (error) {
      console.error('Error reset password:', error);
      alert('Gagal mengirim email reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">Lupa Kata Sandi</h1>
        <p className="forgot-password-subtitle">
          Masukkan email yang terdaftar. Kami akan mengirim link untuk mengubah kata sandi.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="forgot-password-btn" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Email Reset Password'}
          </button>
        </form>

        <p className="back-to-login">
          Kembali ke{' '}
          <button
            type="button"
            className="back-link"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
