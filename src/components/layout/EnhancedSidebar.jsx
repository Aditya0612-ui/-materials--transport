// src/components/layout/EnhancedSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Nav, Button, Badge, Collapse, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';

const EnhancedSidebar = ({
  activeTab,
  setActiveTab,
  isVerified,
  onVerificationClick,
  sidebarCollapsed,
  setSidebarCollapsed
}) => {
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState({
    transport: 0,
    fuel: 0,
    maintenance: 0
  });
  const [recentlyUsed, setRecentlyUsed] = useState(['overview', 'transport', 'fuel-purchase']);

  const menuItems = [
    {
      id: 'overview',
      label: t('dashboard.overview'),
      icon: 'bx bx-home-alt',
      category: 'main'
    },
    {
      id: 'transport-group',
      label: t('navigation.transport'),
      icon: 'bx bx-car',
      isGroup: true,
      category: 'operations',
      children: [
        {
          id: 'transport',
          label: t('transport.title'),
          icon: 'bx bx-truck',
          notifications: notifications.transport
        },
        {
          id: 'transport-history',
          label: t('transport.history'),
          icon: 'bx bx-history',
          notifications: notifications.transport
        }
      ]
    },
    {
      id: 'fuel-group',
      label: t('navigation.fuel'),
      icon: 'bx bx-gas-pump',
      isGroup: true,
      category: 'operations',
      children: [
        {
          id: 'fuel-purchase',
          label: t('fuel.title'),
          icon: 'bx bx-cart',
          notifications: notifications.fuel
        },
        {
          id: 'fuel-records',
          label: t('fuel.consumption'),
          icon: 'bx bx-bar-chart-alt-2'
        }
      ]
    },
    {
      id: 'maintenance-group',
      label: t('navigation.maintenance'),
      icon: 'bx bx-wrench',
      isGroup: true,
      category: 'operations',
      children: [
        {
          id: 'maintenance-schedule',
          label: t('maintenance.schedule'),
          icon: 'bx bx-calendar',
          notifications: notifications.maintenance
        },
        {
          id: 'service-history',
          label: t('maintenance.history'),
          icon: 'bx bx-file'
        }
      ]
    },
    {
      id: 'billing',
      label: t('billing.title'),
      icon: 'bx bx-receipt',
      category: 'operations'
    }
  ];

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    if (item.isGroup) {
      return item.label.toLowerCase().includes(searchLower) ||
        item.children.some(child =>
          child.label.toLowerCase().includes(searchLower)
        );
    }

    return item.label.toLowerCase().includes(searchLower);
  });

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleMenuClick = (itemId) => {
    setActiveTab(itemId);

    // Add to recently used
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== itemId);
      return [itemId, ...filtered].slice(0, 5);
    });

    // Close sidebar on mobile after clicking a menu item
    if (window.innerWidth < 992) {
      setSidebarCollapsed(true);
    }
  };


  // Auto-expand groups that contain the active tab
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.isGroup && item.children.some(child => child.id === activeTab)) {
        setExpandedMenus(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [activeTab]);

  const renderMenuItem = (item) => {
    if (item.isGroup) {
      const isExpanded = expandedMenus[item.id];
      const hasActiveChild = item.children.some(child => child.id === activeTab);

      return (
        <div key={item.id} className="sidebar-group">
          <div
            className={`sidebar-group-header ${isExpanded ? 'expanded' : ''} ${hasActiveChild ? 'has-active' : ''}`}
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
                  title={sidebarCollapsed ? child.label : ''}
                >
                  <i className={`sidebar-icon ${child.icon}`}></i>
                  {!sidebarCollapsed && (
                    <>
                      <span className="sidebar-label">
                        {child.label}
                      </span>
                    </>
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
            <span className="sidebar-label">
              {item.label}
            </span>
          </>
        )}
      </Nav.Link>
    );
  };

  return (
    <>
      <div 
        className={`sidebar enhanced-sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'} 
          fixed lg:static inset-y-0 left-0 z-[1000] transform transition-transform duration-300 ease-in-out
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="d-flex align-items-center justify-content-between">
            {!sidebarCollapsed && (
              <div className="sidebar-brand">
                <div className="d-flex align-items-center">
                  <i className="bx bx-car brand-icon me-2"></i>
                  <div>
                    <h6 className="mb-0">Construction Materials & Transport </h6>
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

        {/* Search Bar */}
        {!sidebarCollapsed && (
          <div className="sidebar-search p-3">
            <InputGroup size="sm">
              <InputGroup.Text>
                <i className="bx bx-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={t('common.search') + " menu..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="search-clear-btn"
                >
                  <i className="bx bx-x"></i>
                </Button>
              )}
            </InputGroup>
          </div>
        )}

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

        {/* Recently Used Section */}
        {!sidebarCollapsed && recentlyUsed.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <small className="text-muted">Recently Used</small>
            </div>
            <div className="recent-items">
              {recentlyUsed.slice(0, 3).map(itemId => {
                const item = menuItems.find(m => m.id === itemId) ||
                  menuItems.find(m => m.children?.some(c => c.id === itemId))?.children?.find(c => c.id === itemId);
                if (!item) return null;

                return (
                  <Button
                    key={itemId}
                    variant="link"
                    size="sm"
                    className={`recent-item ${activeTab === itemId ? 'active' : ''}`}
                    onClick={() => handleMenuClick(itemId)}
                  >
                    <i className={`me-2 ${item.icon}`}></i>
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <Nav className="sidebar-nav flex-column">
          {filteredMenuItems.map(renderMenuItem)}
        </Nav>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <div className="d-flex align-items-center">
                <div className="user-avatar">
                  <i className="bx bx-user"></i>
                </div>
                <div className="user-details">
                  <small className="user-name">Admin User</small>
                  <small className="user-role">System Administrator</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EnhancedSidebar;
