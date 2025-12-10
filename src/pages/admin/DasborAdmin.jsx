import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, LogOut, Users } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import './DasborAdmin.css';

const DasborAdmin = () => {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [users, setUsers] = useState([]);

  // Ambil user dari Firestore (role: mahasiswa & dosen)
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', 'in', ['mahasiswa', 'dosen']));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        nama: doc.data().fullName,
        email: doc.data().email,
        peran: doc.data().role.charAt(0).toUpperCase() + doc.data().role.slice(1)
      }));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter(user =>
    user.nama.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleAddUser = () => {
    navigate('/admin/add-user');
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
    <div className="dasbor-admin-container">
      {/* Sidebar */}
      <aside className="dasbor-sidebar">
        <div className="dasbor-logo">
          <Users className="dasbor-logo-icon" />
          <h1 className="dasbor-logo-text">Admin Panel</h1>
        </div>

        <nav className="dasbor-nav">
          <button
            className={`dasbor-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('dashboard', '/admin/dashboard')}
          >
            <LayoutDashboard className="dasbor-nav-icon" />
            <span>Dashboard</span>
          </button>
          
          <button
            className={`dasbor-nav-item ${activeMenu === 'add-user' ? 'active' : ''}`}
            onClick={() => handleNavigation('add-user', '/admin/add-user')}
          >
            <UserPlus className="dasbor-nav-icon" />
            <span>Tambah Pengguna</span>
          </button>
        </nav>

        <div className="dasbor-sidebar-footer">
          <button className="dasbor-logout" onClick={handleLogout}>
            <LogOut className="dasbor-nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dasbor-main">
        <header className="header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-text">Essay Verifier</span>
            </div>
          </div>
          <div className="header-right">
            <div className="user-avatar">A</div>
          </div>
        </header>

        <div className="content">

          <h1 className="page-title">Dasbor Admin</h1>

          {/* Agar card berada di tengah halaman */}
          <div className="dashboard-grid-single">

            {/* Pengelolaan Akun Pengguna */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Pengelolaan Akun Pengguna</h2>
                <button className="btn-primary" onClick={handleAddUser}>
                  + Tambah Akun Baru
                </button>
              </div>

              <p className="card-subtitle">Total {users.length} Pengguna Terdaftar</p>

              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Cari nama, email pengguna"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="search-input"
                />
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>NAMA</th>
                    <th>EMAIL</th>
                    <th>PERAN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.nama}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge badge-${user.peran.toLowerCase()}`}>
                          {user.peran}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default DasborAdmin;
