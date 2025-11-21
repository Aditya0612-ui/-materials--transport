import React, { useState, useEffect } from 'react';
import { Nav, Button, Badge, Collapse } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';

const Sidebar = ({ activeTab, setActiveTab, isVerified, onVerificationClick, sidebarCollapsed, setSidebarCollapsed }) => {
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      id: 'overview',
      label: t('dashboard.overview'),
      icon: 'bx bx-home-alt'
    },
    {
      id: 'transport-group',
      label: t('navigation.transport'),
      icon: 'bx bx-car',
      isGroup: true,
      children: [
        {
          id: 'transport',
          label: t('transport.systemTitle'),
          icon: 'bx bx-bus'
        },
        {
          id: 'transport-history',
          label: t('transport.historyTitle'),
          icon: 'bx bx-history'
        }
      ]
    },
    {
      id: 'fuel-group',
      label: 'Fuel Management',
      icon: 'bx bx-gas-pump',
      isGroup: true,
      children: [
        {
          id: 'fuel-purchase',
          label: 'Fuel Purchase',
          icon: 'bx bx-cart'
        },
        {
          id: 'fuel-records',
          label: 'Fuel Records',
          icon: 'bx bx-bar-chart-alt-2'
        }
      ]
    },
    {
      id: 'business-group',
      label: 'Business Operations',
      icon: 'bx bx-briefcase',
      isGroup: true,
      children: [
        {
          id: 'orders',
          label: 'Orders',
          icon: 'bx bx-package'
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: 'bx bx-group'
        }
      ]
    }
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleMenuClick = (itemId) => {
    setActiveTab(itemId);
  };


  const renderMenuItem = (item) => {
    if (item.isGroup) {
      const isExpanded = expandedMenus[item.id];
      return (
        <div key={item.id} className="sidebar-group">
          <div
            className={`sidebar-group-header ${isExpanded ? 'expanded' : ''}`}
            onClick={() => toggleMenu(item.id)}
          >
            <div className="d-flex align-items-center">
              <i className={`sidebar-icon ${item.icon}`}></i>
              {!sidebarCollapsed && (
                <>
                  <span className="sidebar-label">{item.label}</span>
                  <i className={`expand-arrow bx ${isExpanded ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
                </>
              )}
            </div>
          </div>
          <Collapse in={isExpanded && !sidebarCollapsed}>
            <div className="sidebar-submenu">
              {item.children.map(child => (
                <Nav.Link
                  key={child.id}
                  className={`sidebar-item submenu-item ${activeTab === child.id ? 'active' : ''}`}
                  onClick={() => handleMenuClick(child.id)}
                >
                  <i className={`sidebar-icon ${child.icon}`}></i>
                  <span className="sidebar-label">{child.label}</span>
                  {child.badge && (
                    <Badge bg="danger" className="ms-auto">{child.badge}</Badge>
                  )}
                </Nav.Link>
              ))}
            </div>
          </Collapse>
        </div>
      );
    }

    return (
      <Nav.Link
        key={item.id}
        className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
        onClick={() => handleMenuClick(item.id)}
        title={sidebarCollapsed ? item.label : ''}
      >
        <i className={`sidebar-icon ${item.icon}`}></i>
        {!sidebarCollapsed && (
          <>
            <span className="sidebar-label">{item.label}</span>
            {item.badge && (
              <Badge bg="danger" className="ms-auto">{item.badge}</Badge>
            )}
          </>
        )}
      </Nav.Link>
    );
  };

  return (
    <>
      <div 
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="d-flex align-items-center justify-content-between">
            {!sidebarCollapsed && (
              <div className="sidebar-brand">
                <div className="d-flex align-items-center">
                  <i className="bx bx-car brand-icon me-2"></i>
                  <div>
                    <h6 className="mb-0">Construction Materials & Transport</h6>
                    <small className="text-muted">Management System</small>
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="link"
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <i className={`bx ${sidebarCollapsed ? 'bx-menu' : 'bx-x'}`}></i>
            </Button>
          </div>
        </div>

        {/* Verification Status */}
        <div className="sidebar-verification">
          <Button
            variant={isVerified ? 'success' : 'warning'}
            size="sm"
            className="w-100 verification-btn"
            onClick={onVerificationClick}
          >
            <i className={`sidebar-icon bx ${isVerified ? 'bx-check-shield' : 'bx-lock-alt'}`}></i>
            {!sidebarCollapsed && (
              <span className="sidebar-label">
                {isVerified ? 'Verified Access' : 'Verify Access'}
              </span>
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <Nav className="sidebar-nav flex-column">
          {menuItems.map(renderMenuItem)}
        </Nav>
      </div>
    </>
  );
};

export default Sidebar;
