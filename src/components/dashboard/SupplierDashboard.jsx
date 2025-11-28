// src/components/dashboard/SupplierDashboard.jsx
import React, { useState } from 'react';
import 'boxicons/css/boxicons.min.css';
import '../../styles/mobile-enhancements.css';
import EnhancedSidebar from '../layout/EnhancedSidebar';
import TopBar from '../layout/TopBar';
import StatsCards from './StatsCards';
import VerificationSystem from '../auth/VerificationSystem';
import TransportSystem from '../transport/TransportSystem';
import TransportHistory from '../transport/TransportHistory';
import FuelPurchaseHistory from '../fuel/FuelPurchaseHistory';
import FuelUseRecords from '../fuel/FuelUseRecords';
import MaintenanceSchedule from '../maintenance/MaintenanceSchedule';
import ServiceHistory from '../maintenance/ServiceHistory';
import BillingInvoice from '../billing/BillingInvoice';
import MaintenanceProvider from '../../context/MaintenanceContext';
import TransportProvider from '../../context/TransportContext';

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerificationComplete = (type) => {
    setIsVerified(true);
    console.log(`✅ Verification completed successfully with type: ${type}`);

    // Show success notification
    const event = new CustomEvent('showNotification', {
      detail: {
        message: `Verification successful! Type: ${type.toUpperCase()}`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <MaintenanceProvider>
      <TransportProvider>
        <div className="flex h-screen bg-slate-50 overflow-hidden">
          {/* Mobile sidebar backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 lg:hidden
                ${!sidebarCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setSidebarCollapsed(true)}
            aria-hidden="true"
          />

          <EnhancedSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isVerified={isVerified}
            onVerificationClick={() => setShowVerification(true)}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
            <TopBar
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              activeTab={activeTab}
            />

            <main className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin">
              <div className="max-w-[1600px] mx-auto">
                {activeTab === 'overview' && (
                  <div className="animate-fadeIn">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                      <p className="text-slate-500">Welcome back, here's what's happening today.</p>
                    </div>
                    <StatsCards />
                  </div>
                )}

                {activeTab === 'transport' && (
                  <div className="animate-fadeIn">
                    <TransportSystem />
                  </div>
                )}

                {activeTab === 'transport-history' && (
                  <div className="animate-fadeIn">
                    <TransportHistory />
                  </div>
                )}

                {activeTab === 'fuel-purchase' && (
                  <div className="animate-fadeIn">
                    <FuelPurchaseHistory />
                  </div>
                )}

                {activeTab === 'fuel-records' && (
                  <div className="animate-fadeIn">
                    <FuelUseRecords />
                  </div>
                )}

                {activeTab === 'maintenance-schedule' && (
                  <div className="animate-fadeIn">
                    <MaintenanceSchedule />
                  </div>
                )}

                {activeTab === 'service-history' && (
                  <div className="animate-fadeIn">
                    <ServiceHistory />
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="animate-fadeIn">
                    <BillingInvoice />
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
                    <div className="flex items-center space-x-3 text-sky-600 mb-4">
                      <i className="bx bx-info-circle text-2xl"></i>
                      <h4 className="text-lg font-semibold m-0">Reports Module</h4>
                    </div>
                    <p className="text-slate-600">Reports functionality is coming soon. This module will provide comprehensive reporting capabilities.</p>
                  </div>
                )}

                {activeTab === 'records' && (
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
                    <div className="flex items-center space-x-3 text-indigo-600 mb-4">
                      <i className="bx bx-file text-2xl"></i>
                      <h4 className="text-lg font-semibold m-0">Records Module</h4>
                    </div>
                    <p className="text-slate-600">Records management functionality is coming soon. This module will provide customizable record display capabilities.</p>
                  </div>
                )}
              </div>
            </main>
          </div>

          <VerificationSystem
            show={showVerification}
            onHide={() => setShowVerification(false)}
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      </TransportProvider>
    </MaintenanceProvider>
  );
};

export default SupplierDashboard;