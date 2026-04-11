// src/components/dashboard/layout/Sidebar.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard } from '../../../context/DashboardContext';
import { readAdminStorage } from '../../../context/adminPersistence';
import { useApplications } from '../rent/contexts/ApplicationsContext';
import { useProperties } from '../rent/contexts/PropertiesContext';
import { useMessages } from '../rent/contexts/MessagesContext';
import { useMaintenance } from '../rent/contexts/MaintenanceContext';
import { getUserStorageKey } from '../../shared/utils/userStorageKey';
import iconImage from '../../../assets/domihive-lcon.png';
import logoImage from '../../../assets/domihive-logo.png';

const Sidebar = ({ sidebarState, toggleSidebar, closeMobileSidebar, isMobile, currentDashboard }) => {
  const { user, logout } = useAuth();
  const { applications } = useApplications();
  const { properties, favorites } = useProperties();
  const { threads } = useMessages();
  const { tickets } = useMaintenance();
  const location = useLocation();
  const sidebarNavRef = useRef(null);
  const activeLinkRef = useRef(null);

  const getIsoMs = (value) => {
    const ms = new Date(value || 0).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };

  const sameStringArray = (a = [], b = []) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (String(a[i]) !== String(b[i])) return false;
    }
    return true;
  };

  // Image paths constants
  const IMAGES = {
    icon: iconImage,
    logo: logoImage,
    placeholderIcon: 'https://via.placeholder.com/28?text=DH',
    placeholderLogo: 'https://via.placeholder.com/150x32?text=DomiHive'
  };

  // Get dashboard-specific navigation items - MATCHING HTML STRUCTURE
  const getDashboardNavItems = () => {
    const navConfigs = {
      rent: {
        main: [
          { label: 'Overview', icon: 'chart-pie', path: '/dashboard/rent/overview' },
          { label: 'Browse Properties', icon: 'search', path: '/dashboard/rent/browse' },
          { label: 'Favorites', icon: 'heart', path: '/dashboard/rent/favorites' },
        ],
        applications: [
          { label: 'My Applications', icon: 'file-alt', path: '/dashboard/rent/applications', badge: 0 },
        ],
        management: [
          { label: 'My Properties', icon: 'home', path: '/dashboard/rent/my-properties' },
          { label: 'Maintenance', icon: 'tools', path: '/dashboard/rent/maintenance' },
          { label: 'Payments', icon: 'credit-card', path: '/dashboard/rent/payments' },
          { label: 'Messages', icon: 'comments', path: '/dashboard/rent/messages' },
        ]
      },
      // Other dashboards will be added later
    };

    return navConfigs[currentDashboard] || navConfigs.rent;
  };

  const navItems = getDashboardNavItems();
  const sidebarReadStateKey = `domihive_sidebar_module_reads_${userKey}`;
  const [moduleReadState, setModuleReadState] = useState(() => {
    try {
      const raw = localStorage.getItem(sidebarReadStateKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        messagesSeenAt: parsed?.messagesSeenAt || '',
        maintenanceSeenAt: parsed?.maintenanceSeenAt || '',
        applicationsSeenAt: parsed?.applicationsSeenAt || '',
        seenPendingPropertyIds: Array.isArray(parsed?.seenPendingPropertyIds)
          ? parsed.seenPendingPropertyIds.map((item) => String(item))
          : [],
        seenFavoriteIds: Array.isArray(parsed?.seenFavoriteIds)
          ? parsed.seenFavoriteIds.map((item) => String(item))
          : []
      };
    } catch (_error) {
      return {
        messagesSeenAt: '',
        maintenanceSeenAt: '',
        applicationsSeenAt: '',
        seenPendingPropertyIds: [],
        seenFavoriteIds: []
      };
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(sidebarReadStateKey);
      const parsed = raw ? JSON.parse(raw) : {};
      setModuleReadState({
        messagesSeenAt: parsed?.messagesSeenAt || '',
        maintenanceSeenAt: parsed?.maintenanceSeenAt || '',
        applicationsSeenAt: parsed?.applicationsSeenAt || '',
        seenPendingPropertyIds: Array.isArray(parsed?.seenPendingPropertyIds)
          ? parsed.seenPendingPropertyIds.map((item) => String(item))
          : [],
        seenFavoriteIds: Array.isArray(parsed?.seenFavoriteIds)
          ? parsed.seenFavoriteIds.map((item) => String(item))
          : []
      });
    } catch (_error) {
      setModuleReadState({
        messagesSeenAt: '',
        maintenanceSeenAt: '',
        applicationsSeenAt: '',
        seenPendingPropertyIds: [],
        seenFavoriteIds: []
      });
    }
  }, [sidebarReadStateKey]);

  useEffect(() => {
    try {
      localStorage.setItem(sidebarReadStateKey, JSON.stringify(moduleReadState));
    } catch (_error) {
      // Ignore storage write errors.
    }
  }, [moduleReadState, sidebarReadStateKey]);

  useEffect(() => {
    const path = String(location.pathname || '');
    const nowISO = new Date().toISOString();

    if (path.startsWith('/dashboard/rent/messages')) {
      setModuleReadState((prev) => (prev.messagesSeenAt === nowISO ? prev : { ...prev, messagesSeenAt: nowISO }));
      return;
    }

    if (path.startsWith('/dashboard/rent/maintenance')) {
      setModuleReadState((prev) => (prev.maintenanceSeenAt === nowISO ? prev : { ...prev, maintenanceSeenAt: nowISO }));
      return;
    }

    if (path.startsWith('/dashboard/rent/applications')) {
      setModuleReadState((prev) => (prev.applicationsSeenAt === nowISO ? prev : { ...prev, applicationsSeenAt: nowISO }));
      return;
    }

    if (path.startsWith('/dashboard/rent/my-properties')) {
      const pendingIds = properties
        .filter((property) => String(property?.tenancyStatus || '').toUpperCase() === 'PENDING_MOVE_IN')
        .map((property) => String(property?.propertyId || ''))
        .filter(Boolean)
        .sort();
      setModuleReadState((prev) =>
        sameStringArray(prev.seenPendingPropertyIds || [], pendingIds)
          ? prev
          : { ...prev, seenPendingPropertyIds: pendingIds }
      );
      return;
    }

    if (path.startsWith('/dashboard/rent/favorites')) {
      const currentFavoriteIds = (favorites || [])
        .map((item) => String(item))
        .filter(Boolean)
        .sort();
      setModuleReadState((prev) =>
        sameStringArray(prev.seenFavoriteIds || [], currentFavoriteIds)
          ? prev
          : { ...prev, seenFavoriteIds: currentFavoriteIds }
      );
    }
  }, [location.pathname, properties, favorites]);

  const navBadges = useMemo(() => {
    const activeApplications = applications.filter((app) =>
      ['INSPECTION_SCHEDULED', 'INSPECTION_VERIFIED', 'APPLICATION_STARTED', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW']
        .includes(String(app?.status || '').toUpperCase())
    );

    const unreadMessages = threads.reduce((sum, thread) => {
      const unreadCount = Number(thread?.unreadCount || 0);
      if (unreadCount <= 0) return sum;
      const lastMessageAt =
        thread?.lastUpdatedAt ||
        (Array.isArray(thread?.messages) && thread.messages.length
          ? thread.messages[thread.messages.length - 1]?.createdAt
          : '') ||
        '';
      const isNewSinceSeen = getIsoMs(lastMessageAt) > getIsoMs(moduleReadState?.messagesSeenAt);
      return isNewSinceSeen ? sum + unreadCount : sum;
    }, 0);

    const openMaintenance = tickets.filter((ticket) => {
      const status = String(ticket?.status || '').toUpperCase();
      if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      const latestUpdateAt = Array.isArray(ticket?.updates)
        ? ticket.updates.reduce((latest, update) => {
            const candidate = update?.at || '';
            return getIsoMs(candidate) > getIsoMs(latest) ? candidate : latest;
          }, '')
        : '';
      const eventAt = latestUpdateAt || ticket?.updatedAt || ticket?.requestedAt || ticket?.createdAt || '';
      return getIsoMs(eventAt) > getIsoMs(moduleReadState?.maintenanceSeenAt);
    }).length;

    const seenPendingSet = new Set((moduleReadState?.seenPendingPropertyIds || []).map((id) => String(id)));
    const pendingMoveIn = properties.filter(
      (property) => String(property?.tenancyStatus || '').toUpperCase() === 'PENDING_MOVE_IN'
    ).filter((property) => !seenPendingSet.has(String(property?.propertyId || ''))).length;

    const activeApplicationCount = activeApplications.filter((application) => {
      const eventAt = application?.updatedAtISO || application?.createdAtISO || application?.bookingDateISO || '';
      return getIsoMs(eventAt) > getIsoMs(moduleReadState?.applicationsSeenAt);
    }).length;

    const seenFavoritesSet = new Set((moduleReadState?.seenFavoriteIds || []).map((id) => String(id)));
    const favoritesCount = (favorites || [])
      .map((item) => String(item))
      .filter(Boolean)
      .filter((id) => !seenFavoritesSet.has(id))
      .length;

    return {
      '/dashboard/rent/favorites': favoritesCount,
      '/dashboard/rent/applications': activeApplicationCount,
      '/dashboard/rent/my-properties': pendingMoveIn,
      '/dashboard/rent/maintenance': openMaintenance,
      '/dashboard/rent/messages': unreadMessages
    };
  }, [applications, favorites, properties, threads, tickets, moduleReadState]);

  const getBadgeCount = (path) => Number(navBadges[path] || 0);
  const isExpanded = sidebarState === 'expanded';
  const isCollapsed = sidebarState === 'collapsed';
  const userKey = getUserStorageKey(user);
  const managementUnlockKey = `domihive_management_unlocked_${userKey}`;
  const managementUnlockSessionKey = `domihive_management_unlocked_session_${userKey}`;
  const managementUnlockCookieKey = `domihive_management_unlocked_cookie_${userKey}`;

  const readManagementUnlock = () => {
    try {
      if (localStorage.getItem(managementUnlockKey) === '1') return true;
    } catch (_error) {
      // ignore
    }
    try {
      if (sessionStorage.getItem(managementUnlockSessionKey) === '1') return true;
    } catch (_error) {
      // ignore
    }
    try {
      const cookieToken = `${managementUnlockCookieKey}=1`;
      if (document.cookie.split(';').some((item) => item.trim() === cookieToken)) return true;
    } catch (_error) {
      // ignore
    }
    return false;
  };

  const writeManagementUnlock = () => {
    let unlocked = false;
    try {
      localStorage.setItem(managementUnlockKey, '1');
      unlocked = true;
    } catch (_error) {
      // ignore and try fallbacks
    }
    try {
      sessionStorage.setItem(managementUnlockSessionKey, '1');
      unlocked = true;
    } catch (_error) {
      // ignore
    }
    try {
      document.cookie = `${managementUnlockCookieKey}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      unlocked = true;
    } catch (_error) {
      // ignore
    }
    return unlocked;
  };

  const [managementUnlocked, setManagementUnlocked] = useState(() => {
    return readManagementUnlock();
  });
  const hasApprovedRental = applications.some((application) => application.status === 'APPROVED');
  const hasManagedProperty = properties.some((property) =>
    ['PENDING_MOVE_IN', 'ACTIVE'].includes(property.tenancyStatus)
  );
  const hasAdminTenantRecord = (() => {
    try {
      const adminData = readAdminStorage() || {};
      const tenants = Array.isArray(adminData.tenants) ? adminData.tenants : [];
      const normalizedPhone = String(user?.phone || '').trim();
      const normalizedEmail = String(user?.email || '').trim().toLowerCase();
      const normalizedName = String(user?.name || '').trim().toLowerCase();
      if (!normalizedPhone && !normalizedEmail && !normalizedName) return false;
      return tenants.some((tenant) => {
        const tenantPhone = String(tenant?.phone || '').trim();
        const tenantEmail = String(tenant?.email || '').trim().toLowerCase();
        const tenantName = String(tenant?.name || '').trim().toLowerCase();
        return (
          (normalizedPhone && tenantPhone && tenantPhone === normalizedPhone) ||
          (normalizedEmail && tenantEmail && tenantEmail === normalizedEmail) ||
          (normalizedName && tenantName && tenantName === normalizedName)
        );
      });
    } catch (_error) {
      return false;
    }
  })();
  const canAccessManagement =
    managementUnlocked || hasApprovedRental || hasManagedProperty || hasAdminTenantRecord;

  useEffect(() => {
    setManagementUnlocked(readManagementUnlock());
  }, [managementUnlockKey, managementUnlockSessionKey, managementUnlockCookieKey]);

  useEffect(() => {
    if (!hasApprovedRental && !hasManagedProperty && !hasAdminTenantRecord) return;
    const persisted = writeManagementUnlock();
    setManagementUnlocked(persisted || true);
  }, [
    hasApprovedRental,
    hasManagedProperty,
    hasAdminTenantRecord,
    managementUnlockKey,
    managementUnlockSessionKey,
    managementUnlockCookieKey
  ]);

  // Add CSS for scroll highlight effect - MOVE THIS HOOK BEFORE CONDITIONAL RETURN
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .nav-link.scroll-highlight {
        animation: highlight-pulse 1s ease-in-out;
        box-shadow: 0 0 0 2px rgba(159, 117, 57, 0.3);
      }
      
      @keyframes highlight-pulse {
        0% { box-shadow: 0 0 0 0px rgba(159, 117, 57, 0.3); }
        50% { box-shadow: 0 0 0 4px rgba(159, 117, 57, 0.5); }
        100% { box-shadow: 0 0 0 2px rgba(159, 117, 57, 0.3); }
      }
      
      /* Custom scrollbar styling */
      .sidebar-nav::-webkit-scrollbar {
        width: 6px;
      }

      .sidebar-nav::-webkit-scrollbar:horizontal {
        height: 0px;
        display: none;
      }
      
      .sidebar-nav::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }
      
      .sidebar-nav::-webkit-scrollbar-thumb {
        background: rgba(159, 117, 57, 0.4);
        border-radius: 3px;
      }
      
      .sidebar-nav::-webkit-scrollbar-thumb:hover {
        background: rgba(159, 117, 57, 0.6);
      }

      .dashboard-sidebar::-webkit-scrollbar:horizontal {
        height: 0px;
        display: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Auto-scroll to active nav item with improved logic
  useEffect(() => {
    const sidebarNav = sidebarNavRef.current;
    if (!sidebarNav) return;

    // Small delay to ensure DOM is updated with active class
    setTimeout(() => {
      // Find active link
      const activeLink = sidebarNav.querySelector('.nav-link.active');
      if (!activeLink) return;

      // Store reference for cleanup
      activeLinkRef.current = activeLink;

      // Calculate scroll position
      const navRect = sidebarNav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const navScrollTop = sidebarNav.scrollTop;
      const linkTopRelativeToNav = linkRect.top - navRect.top + navScrollTop;

      // Calculate middle position
      const targetScrollTop = linkTopRelativeToNav - (navRect.height / 2) + (linkRect.height / 2);

      // Only scroll if link is not in viewport
      const isInView = (
        linkTopRelativeToNav >= navScrollTop &&
        linkTopRelativeToNav <= navScrollTop + navRect.height - linkRect.height
      );

      if (!isInView) {
        // Smooth scroll to position
        sidebarNav.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }

      // Add highlight effect
      activeLink.classList.add('scroll-highlight');

      // Remove highlight after animation
      setTimeout(() => {
        if (activeLinkRef.current === activeLink) {
          activeLink.classList.remove('scroll-highlight');
        }
      }, 1000);
    }, 100);
  }, [location.pathname, sidebarState]);

  // Handle nav link click for auto-scroll
  const handleNavClick = (e) => {
    // Close mobile sidebar if on mobile
    if (isMobile && closeMobileSidebar) {
      closeMobileSidebar();
    }

    const clickedLink = e.currentTarget;
    const sidebarNav = sidebarNavRef.current;

    if (!sidebarNav) return;

    // Calculate scroll position
    const navRect = sidebarNav.getBoundingClientRect();
    const linkRect = clickedLink.getBoundingClientRect();
    const navScrollTop = sidebarNav.scrollTop;
    const linkTopRelativeToNav = linkRect.top - navRect.top + navScrollTop;

    // Calculate middle position
    const targetScrollTop = linkTopRelativeToNav - (navRect.height / 2) + (linkRect.height / 2);

    // Smooth scroll to position
    sidebarNav.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });

    // Add highlight effect
    clickedLink.classList.add('scroll-highlight');

    // Remove highlight after animation
    setTimeout(() => {
      clickedLink.classList.remove('scroll-highlight');
    }, 1000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      // Redirect handled by AuthContext
    }
  };

  // CRITICAL FIX: Move conditional return AFTER all hooks
  // Don't render sidebar if user not loaded
  if (!user) return null;

  return (
    <>
      {/* Sidebar Container with Glassmorphism Effect */}
      <aside className={`
        dashboard-sidebar
        fixed top-0 left-0 h-screen z-50
        transition-all duration-300 ease-in-out
        ${isMobile ? (isCollapsed ? 'w-20' : 'w-72') : isCollapsed ? 'w-20' : 'w-64'}
        bg-white/80 backdrop-blur-lg backdrop-saturate-150
        flex flex-col
        border-r border-white/30
        shadow-lg shadow-black/5
        overflow-x-hidden overflow-y-hidden
      `}>

        {/* Sidebar Header with Logo */}
        <div className={`sidebar-header shrink-0 px-6 py-5 flex items-center min-h-[80px] border-b border-white/30 bg-white/60 backdrop-blur-sm transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isCollapsed && !isMobile ? (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-white/40 transition-all cursor-pointer group relative"
              title="Expand Sidebar"
            >
              <img
                src={IMAGES.icon}
                alt="Logo"
                className="h-8 "
              />
              {/* Opener indicator on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded-lg">
                <i className="fas fa-chevron-right text-(--accent-color,#9F7539) text-xs"></i>
              </div>
            </button>
          ) : (
            <>
              <div className="sidebar-logo flex items-center gap-3">
                <img
                  src={isMobile && isCollapsed ? IMAGES.icon : IMAGES.logo}
                  alt="DomiHive"
                  className="h-8 w-auto object-cover"
                />
              </div>

              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-white/40 text-(--accent-color,#9F7539) transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              )}
            </>
          )}
        </div>

        {/* Sidebar Navigation - Scrollable */}
        <nav
          ref={sidebarNavRef}
          className="sidebar-nav flex-1 min-h-0 py-4 transition-all duration-300 overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#9f7539 transparent' }}
        >
          {/* MAIN Section */}
          <div className="nav-section mb-6">
            {!isCollapsed && (
              <div className="nav-section-title px-6 mb-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                MAIN
              </div>
            )}

            <div className="space-y-1 px-3">
              {navItems.main.map((item) => (
                (() => {
                  const badgeCount = getBadgeCount(item.path);
                  return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `nav-link group relative flex items-center gap-3 ${isCollapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'} rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-white/40 text-[#0e1f42] backdrop-blur-sm'
                      : 'text-[#334155] hover:bg-white/40 hover:text-[#0e1f42] backdrop-blur-sm'
                    }
                    ${isCollapsed ? 'mx-2' : 'mx-3'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <i className={`fas fa-${item.icon} ${isCollapsed ? 'text-lg' : 'text-base'} w-5 text-center ${isActive ? 'text-(--accent-color,#9f7539)' : 'text-[#64748b]'} icon-clean transition-colors`}></i>
                      {!isCollapsed && (
                        <>
                          <span className="nav-text font-medium text-sm">{item.label}</span>
                          {badgeCount > 0 && (
                            <span className="nav-badge bg-red-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center ml-auto">
                              {badgeCount > 99 ? '99+' : badgeCount}
                            </span>
                          )}
                        </>
                      )}

                      {isCollapsed && badgeCount > 0 && (
                        <span className="nav-badge absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
                  );
                })()
              ))}
            </div>
          </div>

          {/* CONTINUE APPLICATIONS Section */}
          <div className="nav-section mb-6">
            {!isCollapsed && (
              <div className="nav-section-title px-6 mb-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                APPLICATIONS
              </div>
            )}

            <div className="space-y-1 px-3">
              {navItems.applications.map((item) => (
                (() => {
                  const badgeCount = getBadgeCount(item.path);
                  return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `nav-link group relative flex items-center gap-3 ${isCollapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'} rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-white/40 text-[#0e1f42] font-semibold backdrop-blur-sm'
                      : 'text-[#334155] hover:bg-white/40 hover:text-[#0e1f42] backdrop-blur-sm'
                    }
                    ${isCollapsed ? 'mx-2' : 'mx-3'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <i className={`fas fa-${item.icon} ${isCollapsed ? 'text-lg' : 'text-base'} w-5 text-center ${isActive ? 'text-(--accent-color,#9f7539)' : 'text-[#64748b]'} transition-colors`}></i>
                      {!isCollapsed && (
                        <>
                          <span className="nav-text font-medium text-sm">{item.label}</span>
                          {badgeCount > 0 && (
                            <span className="nav-badge bg-red-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center ml-auto">
                              {badgeCount > 99 ? '99+' : badgeCount}
                            </span>
                          )}
                        </>
                      )}

                      {/* Badge for collapsed state */}
                      {isCollapsed && badgeCount > 0 && (
                        <span className="nav-badge absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </span>
                      )}

                    </>
                  )}
                </NavLink>
                  );
                })()
              ))}
            </div>
          </div>

          {/* MY MANAGEMENTS Section */}
          {canAccessManagement ? (
            <div className="nav-section mb-6">
              {!isCollapsed && (
                <div className="nav-section-title px-6 mb-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  MANAGEMENT
                </div>
              )}

              <div className="space-y-1 px-3">
                {navItems.management.map((item) => (
                  (() => {
                    const badgeCount = getBadgeCount(item.path);
                    return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `nav-link group relative flex items-center gap-3 ${isCollapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'} rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-white/40 text-[#0e1f42] font-semibold backdrop-blur-sm'
                        : 'text-[#334155] hover:bg-white/40 hover:text-[#0e1f42] backdrop-blur-sm'
                      }
                      ${isCollapsed ? 'mx-2' : 'mx-3'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <i className={`fas fa-${item.icon} ${isCollapsed ? 'text-lg' : 'text-base'} w-5 text-center ${isActive ? 'text-(--accent-color,#9f7539)' : 'text-[#64748b]'} transition-colors`}></i>
                        {!isCollapsed && (
                          <>
                            <span className="nav-text font-medium text-sm">{item.label}</span>
                            {badgeCount > 0 && (
                              <span className="nav-badge bg-red-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center ml-auto">
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </span>
                            )}
                          </>
                        )}

                        {isCollapsed && badgeCount > 0 && (
                          <span className="nav-badge absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                            {badgeCount > 9 ? '9+' : badgeCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                    );
                  })()
                ))}
              </div>
            </div>
          ) : (
            <div className="nav-section mb-6">
              {!isCollapsed && (
                <>
                  <div className="nav-section-title px-6 mb-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                    MANAGEMENT
                  </div>
                  <div className="mx-6 rounded-lg border border-dashed border-[#d0d7df] bg-white/30 px-3 py-2 text-xs text-[#64748b]">
                    <div className="font-semibold text-[#475467] mb-1">
                      <i className="fas fa-lock mr-2"></i>
                      Locked
                    </div>
                    Complete inspection and get approved to unlock My Management.
                  </div>
                </>
              )}
            </div>
          )}
        </nav>

        {/* Sidebar Footer - User Profile */}
        <div className="sidebar-footer shrink-0 p-5 border-t border-white/30 bg-white/60 backdrop-blur-sm">
          {!isCollapsed ? (
            <>
              {/* Expanded View */}
              <div className="user-profile flex items-center gap-3 mb-4">
                <div className="user-avatar w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-(--accent-color,#9f7539)/20">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-(--accent-color,#9f7539) flex items-center justify-center">
                      <i className="fas fa-user text-white"></i>
                    </div>
                  )}
                </div>

                <div className="user-info flex-1 min-w-0">
                  <div className="user-name font-semibold text-[#334155] truncate text-sm">
                    {user.name || 'User'}
                  </div>
                  <div className="user-role text-[10px] text-[#64748b] uppercase tracking-wider font-bold">
                    Tenant
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="logout-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all font-medium text-sm shadow-sm"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Collapsed View */}
              <div className="flex flex-col items-center gap-4">
                <div className="user-profile relative group">
                  <div className="user-avatar w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-(--accent-color,#9f7539)/20 group-hover:ring-(--accent-color,#9f7539)/40 transition-all">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-(--accent-color,#9f7539) flex items-center justify-center">
                        <i className="fas fa-user text-white text-xs"></i>
                      </div>
                    )}
                  </div>

                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="group relative p-2.5 rounded-lg bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 transition-all shadow-sm"
                >
                  <i className="fas fa-sign-out-alt text-sm"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
