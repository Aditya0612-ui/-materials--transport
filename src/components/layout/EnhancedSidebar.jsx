// src/components/layout/EnhancedSidebar.jsx
import React, { useState, useEffect } from 'react';
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
    // If sidebar is collapsed, expand it first
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      // Then expand the menu after a short delay
      setTimeout(() => {
        setExpandedMenus(prev => ({
          ...prev,
          [menuId]: true
        }));
      }, 100);
    } else {
      // If sidebar is already expanded, just toggle the menu
      setExpandedMenus(prev => ({
        ...prev,
        [menuId]: !prev[menuId]
      }));
    }
  };

  const handleMenuClick = (itemId) => {
    setActiveTab(itemId);

    // Add to recently used
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== itemId);
      return [itemId, ...filtered].slice(0, 5);
    });

    // Close sidebar on mobile after clicking a menu item
    if (window.innerWidth < 1024) {
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
        <div key={item.id} className="mb-1">
          <div
            className={`
              flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-200
              ${hasActiveChild ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            onClick={() => toggleMenu(item.id)}
            title={sidebarCollapsed ? `${item.label} - Click to expand` : ''}
          >
            <i className={`${item.icon} text-xl w-6 text-center ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-sm whitespace-nowrap">{item.label}</span>
                <i className={`bx ${isExpanded ? 'bx-chevron-up' : 'bx-chevron-down'} text-lg transition-transform duration-200`}></i>
              </>
            )}
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && !sidebarCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="ml-4 border-l-2 border-slate-100 my-1">
              {item.children.map(child => (
                <div
                  key={child.id}
                  className={`
                    flex items-center px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-200 text-sm
                    ${activeTab === child.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'}
                  `}
                  onClick={() => handleMenuClick(child.id)}
                  title={sidebarCollapsed ? child.label : ''}
                >
                  <i className={`${child.icon} text-lg w-6 text-center mr-2`}></i>
                  <span className="truncate whitespace-nowrap">{child.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        className={`
          flex items-center px-4 py-3 mx-2 mb-1 rounded-xl cursor-pointer transition-all duration-200
          ${activeTab === item.id
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
            : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}
        `}
        onClick={() => handleMenuClick(item.id)}
        title={sidebarCollapsed ? item.label : ''}
      >
        <i className={`${item.icon} text-xl w-6 text-center mr-3`}></i>
        {!sidebarCollapsed && (
          <span className="flex-1 text-sm font-medium whitespace-nowrap">{item.label}</span>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 shadow-xl lg:shadow-none lg:static transition-all duration-300 ease-in-out flex flex-col flex-shrink-0
        ${sidebarCollapsed ? 'w-[0px] lg:w-20 -translate-x-full lg:translate-x-0' : 'w-72 translate-x-0'}
      `}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
              <i className="bx bx-car text-xl"></i>
            </div>
            <div className="flex flex-col min-w-0">
              <h6 className="font-bold text-slate-800 text-sm truncate">Transport System</h6>
              <span className="text-xs text-slate-500 truncate">Management Dashboard</span>
            </div>
          </div>
        )}
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors lg:hidden"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <i className='bx bx-x text-xl'></i>
        </button>
      </div>

      {/* Search Bar */}
      {!sidebarCollapsed && (
        <div className="p-4 border-b border-slate-50">
          <div className="relative">
            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder={t('common.search') + "..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Verification Status */}
      <div className="p-4">
        <button
          className={`
            w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
            ${isVerified
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100'}
          `}
          onClick={onVerificationClick}
        >
          <i className={`bx ${isVerified ? 'bx-check-shield' : 'bx-lock-alt'} text-lg`}></i>
          {!sidebarCollapsed && (
            <span className="whitespace-nowrap">{isVerified ? 'Verified Access' : 'Verify Access'}</span>
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {filteredMenuItems.map(renderMenuItem)}
      </div>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <i className="bx bx-user text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">System Administrator</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default EnhancedSidebar;
