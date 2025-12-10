import { Check, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './awal.css';

export default function Awal() {
  const navigate = useNavigate();

  return (
    <div className="awal-container">
      {/* Header/Navigation */}
      <nav className="awal-navbar">
        <div className="awal-nav-content">
          <div className="awal-logo-section">
            <div className="awal-logo-icon">
              <Check className="awal-check-icon" />
            </div>
            <span className="awal-brand-name">Essay Verifier</span>
          </div>
          
          <div className="awal-nav-buttons">
            <button 
              className="awal-btn-login"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="awal-btn-register"
              onClick={() => navigate('/register')}
            >
              Registrasi
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="awal-hero-section">
        <div className="awal-hero-grid">
          {/* Left Content */}
          <div className="awal-hero-content">
            <h1 className="awal-hero-title">
              Verifikasi Integritas Esai dengan Teknologi AI
            </h1>
            
            <p className="awal-hero-description">
              Platform canggih untuk membantu dosen dan mahasiswa mendeteksi 
              potensi ketidakjujuran dalam tulisan akademis secara cepat dan akurat.
            </p>
            
            <button 
              className="awal-btn-start"
              onClick={() => navigate('/login')}
            >
              Mulai Analisis
            </button>
          </div>

          {/* Right Image/Illustration */}
          <div className="awal-illustration-container">
            <div className="awal-illustration-card">
              <div className="awal-chart-container">
                {/* Bar Chart Illustration */}
                <div className="awal-bar-chart">
                  <div className="awal-bar awal-bar-1"></div>
                  <div className="awal-bar awal-bar-2"></div>
                  <div className="awal-bar awal-bar-3"></div>
                  <div className="awal-bar awal-bar-4"></div>
                  <div className="awal-bar awal-bar-5"></div>
                  <div className="awal-bar awal-bar-6"></div>
                  <div className="awal-bar awal-bar-7"></div>
                  <div className="awal-bar awal-bar-8"></div>
                </div>
              </div>
              
              {/* Base platform */}
              <div className="awal-chart-base"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="awal-footer">
        <div className="awal-footer-content">
          {/* Footer Links */}
          <div className="awal-footer-links">
            <button className="awal-footer-link">Tentang Kami</button>
            <button className="awal-footer-link">FAQ</button>
            <button className="awal-footer-link">Kontak</button>
          </div>

          {/* Social Media Icons */}
          <div className="awal-social-icons">
            <button className="awal-social-btn">
              <Twitter className="awal-social-icon" />
            </button>
            <button className="awal-social-btn">
              <Linkedin className="awal-social-icon" />
            </button>
            <button className="awal-social-btn">
              <Facebook className="awal-social-icon" />
            </button>
          </div>

          {/* Copyright */}
          <div className="awal-copyright">
            © 2025 Essay Verifier. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

