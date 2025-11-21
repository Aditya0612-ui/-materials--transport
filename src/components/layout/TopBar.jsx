import React, { useState } from 'react';
import { Navbar, Nav, Button, Dropdown, Badge, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';
import '../../styles/topbar.css';
import AddVehicleForm from '../forms/AddVehicleForm';
import AddFuelRecordForm from '../forms/AddFuelRecordForm';
import LanguageSwitcher from '../common/LanguageSwitcher';
import AdminLogin from '../auth/AdminLogin';
import { useAuth } from '../../context/AuthContext';

const TopBar = ({ sidebarCollapsed, setSidebarCollapsed, activeTab }) => {
  const { t } = useTranslation();
  const { isAuthenticated, adminData, logout, photoURL, provider } = useAuth();
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showAddFuelRecordForm, setShowAddFuelRecordForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleLoginSuccess = (userData) => {
    setShowLoginModal(false);
  };

  const getPageTitle = (tab) => {
    const titles = {
      'overview': t('dashboard.overview'),
      'transport': t('transport.systemTitle'),
      'transport-history': t('transport.historyTitle'),
      'vehicle-tracking': t('transport.liveTracking'),
      'fuel-purchase': t('fuel.title'),
      'fuel-records': t('fuel.consumption'),
      'maintenance-schedule': t('maintenance.schedule'),
      'service-history': t('maintenance.history'),
      'parts-inventory': t('maintenance.inventory'),
      'billing': t('billing.title'),
      'contracts': t('business.contracts'),
      'reports': t('navigation.reports'),
      'records': 'Custom Records'
    };
    return titles[tab] || t('common.dashboard');
  };

  const getPageIcon = (tab) => {
    const icons = {
      'overview': 'bx bx-home-alt',
      'transport': 'bx bx-bus',
      'transport-history': 'bx bx-history',
      'vehicle-tracking': 'bx bx-map-pin',
      'fuel-purchase': 'bx bx-cart',
      'fuel-records': 'bx bx-bar-chart-alt-2',
      'maintenance-schedule': 'bx bx-calendar',
      'service-history': 'bx bx-file',
      'parts-inventory': 'bx bx-cog',
      'billing': 'bx bx-receipt',
      'contracts': 'bx bx-file-blank',
      'reports': 'bx bx-line-chart',
      'records': 'bx bx-file'
    };
    return icons[tab] || 'bx bx-home-alt';
  };

  return (
    <Navbar className="topbar" expand="lg">
      <div className="d-flex align-items-center w-100">
        {/* Mobile Menu Toggle */}
        <Button
          variant="link"
          className="mobile-menu-toggle d-lg-none me-2"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <i className="bx bx-menu"></i>
        </Button>

        {/* Page Title */}
        <div className="page-title-section flex-grow-1">
          <div className="d-flex align-items-center">
            <i className={`page-icon d-none d-sm-flex ${getPageIcon(activeTab)}`}></i>
            <div className="page-title-text">
              <h5 className="mb-0">{getPageTitle(activeTab)}</h5>
              <small className="text-muted d-none d-md-block">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            </div>
          </div>
        </div>

        <div className="quick-actions flex-shrink-0">
          {/* Language Switcher - Hide on mobile */}
          <div className="me-2 d-none d-md-block">
            <LanguageSwitcher />
          </div>

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <Dropdown>
              <Dropdown.Toggle variant="link" className="user-profile-btn p-0">
                <div className="user-avatar-small">
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt="User Avatar" 
                      className="user-avatar-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <i className={`bx bx-user ${photoURL ? 'd-none' : ''}`}></i>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="user-menu">
                <Dropdown.Header>
                  <div className="user-info">
                    <div className="user-name">
                      {adminData?.displayName || adminData?.username || adminData?.email?.split('@')[0] || 'Admin'}
                    </div>
                    <small className="user-email">
                      {adminData?.email || 'admin@dashboard.com'}
                    </small>
                    {provider && provider !== 'local' && (
                      <small className="user-provider">
                        <i className={`bx bxl-${provider === 'google.com' ? 'google' : provider === 'facebook.com' ? 'facebook' : provider === 'twitter.com' ? 'twitter' : provider === 'github.com' ? 'github' : 'user'} me-1`}></i>
                        {provider === 'google.com' ? 'Google' : provider === 'facebook.com' ? 'Facebook' : provider === 'twitter.com' ? 'Twitter' : provider === 'github.com' ? 'GitHub' : provider}
                      </small>
                    )}
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                {/* Show language switcher in menu on mobile */}
                <div className="d-md-none px-3 py-2">
                  <LanguageSwitcher />
                </div>
                <Dropdown.Divider className="d-md-none" />
                <Dropdown.Item>
                  <i className="bx bx-cog me-2"></i> {t('navigation.settings')}
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="bx bx-user me-2"></i> {t('navigation.profile')}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="text-danger" onClick={handleLogout}>
                  <i className="bx bx-log-out me-2"></i> {t('navigation.logout')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowLoginModal(true)}
              className="login-btn"
            >
              <i className="bx bx-log-in me-1"></i>
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Add Vehicle Form Modal */}
      <AddVehicleForm
        show={showAddVehicleForm}
        onHide={() => setShowAddVehicleForm(false)}
      />

      {/* Add Fuel Record Form Modal */}
      <AddFuelRecordForm
        show={showAddFuelRecordForm}
        onHide={() => setShowAddFuelRecordForm(false)}
      />

      {/* Admin Login Modal */}
      <AdminLogin
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </Navbar>
  );
};

export default TopBar;
