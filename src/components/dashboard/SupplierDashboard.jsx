// src/components/dashboard/SupplierDashboard.jsx
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 992);
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
          <div className="dashboard-layout">
            {/* Mobile sidebar backdrop */}
            <div 
              className={`fixed inset-0 bg-black transition-opacity duration-300 z-[999] lg:hidden
                ${!sidebarCollapsed ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
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
            
            <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
              <TopBar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                activeTab={activeTab}
              />
              
              <div className="content-area">
                <Container fluid className="p-0">
                  {activeTab === 'overview' && (
                    <StatsCards />
                  )}

                  {activeTab === 'transport' && (
                    <TransportSystem />
                  )}

                  {activeTab === 'transport-history' && (
                    <TransportHistory />
                  )}

                  {activeTab === 'fuel-purchase' && (
                    <FuelPurchaseHistory />
                  )}

                  {activeTab === 'fuel-records' && (
                    <FuelUseRecords />
                  )}

                  {activeTab === 'maintenance-schedule' && (
                    <MaintenanceSchedule />
                  )}

                  {activeTab === 'service-history' && (
                    <ServiceHistory />
                  )}

                  {activeTab === 'billing' && (
                    <BillingInvoice />
                  )}

                  {activeTab === 'reports' && (
                    <div className="container-fluid p-4">
                      <div className="alert alert-info">
                        <h4><i className="bx bx-info-circle me-2"></i>Reports Module</h4>
                        <p>Reports functionality is coming soon. This module will provide comprehensive reporting capabilities.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'records' && (
                    <div className="container-fluid p-4">
                      <div className="alert alert-info">
                        <h4><i className="bx bx-file me-2"></i>Records Module</h4>
                        <p>Records management functionality is coming soon. This module will provide customizable record display capabilities.</p>
                      </div>
                    </div>
                  )}
                </Container>
              </div>
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