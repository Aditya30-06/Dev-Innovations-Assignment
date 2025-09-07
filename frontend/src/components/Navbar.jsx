import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  User
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Customers', href: '/customers', icon: Users },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/dashboard" className="logo-text">Mini CRM</Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} to={item.href} className="nav-link">
                <Icon className="nav-icon" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Profile dropdown */}
        <div className="profile-section">
          <button className="profile-btn" onClick={toggleProfile}>
            <div className="profile-avatar">
              <User className="profile-avatar-icon" />
            </div>
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown" >
              <div className="profile-info">
                <div style={{margin:"30px"}}></div>
                <div className="name">{user?.name}</div>
                <div className="email">{user?.email}</div>
                <div className="role">{user?.role}</div>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut className="logout-icon" />
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="mobile-menu-btn">
          <button onClick={toggleMenu}>
            {isMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                to={item.href} 
                className="mobile-link" 
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="nav-icon" />
                {item.name}
              </Link>
            );
          })}
          <div className="mobile-profile">
            <div className="profile-avatar">
              <User className="profile-avatar-icon" />
            </div>
            <div className="info">
              <div className="name">{user?.name}</div>
              <div className="email">{user?.email}</div>
              <div className="role">{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="mobile-logout-btn">
              <LogOut className="logout-icon" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
