// src/components/layout/TopBar.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';
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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleLoginSuccess = (userData) => {
    setShowLoginModal(false);
  };

  const getPageTitle = (tab) => {
    // Check if mobile view
    const isMobile = window.innerWidth < 768;

    const titles = {
      'overview': t('dashboard.overview'),
      'transport': isMobile ? 'Transport System' : t('transport.systemTitle'),
      'transport-history': isMobile ? 'Trip History' : 'Transport History & Trip Management',
      'vehicle-tracking': isMobile ? 'Live Tracking' : t('transport.liveTracking'),
      'fuel-purchase': t('fuel.title'),
      'fuel-records': isMobile ? 'Fuel Records' : t('fuel.consumption'),
      'maintenance-schedule': isMobile ? 'Maintenance' : t('maintenance.schedule'),
      'service-history': isMobile ? 'Service History' : t('maintenance.history'),
      'parts-inventory': isMobile ? 'Parts' : t('maintenance.inventory'),
      'billing': t('billing.title'),
      'contracts': t('business.contracts'),
      'reports': t('navigation.reports'),
      'records': 'Custom Records'
    };
    return titles[tab] || t('common.dashboard');
  };

  const getPageSubtitle = (tab) => {
    const subtitles = {
      'transport-history': 'Create new trips from Transport System section'
    };
    return subtitles[tab] || null;
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
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 backdrop-blur-sm bg-white/80">
      <div className="flex items-center flex-1">
        {/* Mobile Menu Toggle */}
        <button
          className="p-2 -ml-2 mr-2 rounded-lg text-slate-500 hover:bg-slate-50 lg:hidden"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <i className="bx bx-menu text-2xl"></i>
        </button>

        {/* Page Title - Hidden on mobile */}
        <div className="hidden md:flex items-center">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 mr-3">
            <i className={`${getPageIcon(activeTab)} text-xl`}></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{getPageTitle(activeTab)}</h1>
            <div className="flex items-center text-xs text-slate-500 mt-0.5">
              {getPageSubtitle(activeTab) ? (
                <>
                  <i className="bx bx-info-circle mr-1"></i>
                  {getPageSubtitle(activeTab)}
                </>
              ) : (
                <span>
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Language Switcher - Hide on mobile */}
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        {/* User Profile / Login */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              onClick={() => setShowUserMenu(!showUserMenu)}
              onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 overflow-hidden">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <i className={`bx bx-user ${photoURL ? 'hidden' : ''}`}></i>
              </div>
              <i className="bx bx-chevron-down text-slate-400 hidden md:block"></i>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-fadeIn origin-top-right">
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {adminData?.displayName || adminData?.username || adminData?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {adminData?.email || 'admin@dashboard.com'}
                  </p>
                  {provider && provider !== 'local' && (
                    <div className="mt-1 flex items-center text-xs text-slate-400">
                      <i className={`bx bxl-${provider === 'google.com' ? 'google' : provider === 'facebook.com' ? 'facebook' : provider === 'twitter.com' ? 'twitter' : provider === 'github.com' ? 'github' : 'user'} mr-1`}></i>
                      {provider === 'google.com' ? 'Google' : provider === 'facebook.com' ? 'Facebook' : provider === 'twitter.com' ? 'Twitter' : provider === 'github.com' ? 'GitHub' : provider}
                    </div>
                  )}
                </div>

                <div className="md:hidden px-4 py-2 border-b border-slate-50">
                  <LanguageSwitcher />
                </div>

                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 flex items-center">
                    <i className="bx bx-cog mr-2 text-lg"></i>
                    {t('navigation.settings')}
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 flex items-center">
                    <i className="bx bx-user mr-2 text-lg"></i>
                    {t('navigation.profile')}
                  </button>
                </div>

                <div className="border-t border-slate-50 py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    onClick={handleLogout}
                  >
                    <i className="bx bx-log-out mr-2 text-lg"></i>
                    {t('navigation.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 font-medium text-sm"
          >
            <i className="bx bx-log-in mr-2"></i>
            Login
          </button>
        )}
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
    </header>
  );
};

export default TopBar;
