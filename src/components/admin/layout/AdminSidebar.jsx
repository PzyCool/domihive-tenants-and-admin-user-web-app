import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DomihiveLogo from '../../../assets/domihive-logo.png';
import DomihiveIcon from '../../../assets/domihive-lcon.png';
import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  MapPinned,
  ClipboardCheck,
  House,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Wrench,
  Image,
  Clock3,
} from 'lucide-react';

const navSections = [
  {
    title: 'MAIN',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/clients', label: 'Clients', icon: Users },
      { to: '/admin/properties', label: 'Properties', icon: Building2 },
      { to: '/admin/tenants', label: 'Tenants', icon: House },
    ],
  },
  {
    title: 'OPERATIONS CORE',
    items: [
      { to: '/admin/locations-filters', label: 'Locations & Filters', icon: MapPinned },
      { to: '/admin/inspections', label: 'Inspections', icon: ClipboardCheck },
    ],
  },
  {
    title: 'APPLICATION REVIEWS',
    items: [
      { to: '/admin/applications', label: 'Applications', icon: FileText },
    ],
  },
  {
    title: 'MAINTENANCE TEAM',
    items: [
      { label: 'Maintenance Operations', icon: Wrench, comingSoon: true },
    ],
  },
  {
    title: 'LEGAL & DOC CONTRACTS',
    items: [
      { to: '/admin/content-policies', label: 'Content & Policies', icon: FileText },
    ],
  },
  {
    title: 'MEDIA OPERATIONS',
    items: [
      { label: 'Media Operations', icon: Image, comingSoon: true },
    ],
  },
];

const AdminSidebar = ({ sidebarState, toggleSidebar, closeMobileSidebar, isMobile }) => {
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [tooltip, setTooltip] = useState({ text: '', top: 0, left: 0, visible: false });
  const isCollapsed = sidebarState === 'collapsed';
  const showCollapsedToggle = isCollapsed && isHoveringLogo && !isMobile;

  const showTooltip = (e, text) => {
    if (!isCollapsed || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
      visible: true,
    });
  };

  const hideTooltip = () => setTooltip((prev) => ({ ...prev, visible: false }));

  const handleNavClick = () => {
    hideTooltip();
    closeMobileSidebar();
  };

  return (
    <>
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`
          admin-sidebar fixed top-0 left-0 h-screen z-[1200]
          transition-all duration-300 ease-in-out
          ${isMobile ? (isCollapsed ? 'w-20 -translate-x-full' : 'w-72 translate-x-0') : isCollapsed ? 'w-20' : 'w-64'}
          bg-white/80 dark:bg-[#111827]/85 backdrop-blur-lg backdrop-saturate-150
          border-r border-white/30 dark:border-white/10
          shadow-md shadow-black/5
          flex flex-col overflow-x-hidden overflow-y-hidden
        `}
      >
        <div className={`shrink-0 px-6 py-5 flex items-center min-h-[80px] border-b border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isCollapsed && !isMobile ? (
            <div
              className="relative flex items-center justify-center h-9 w-9"
              onMouseEnter={() => setIsHoveringLogo(true)}
              onMouseLeave={() => setIsHoveringLogo(false)}
            >
              {!showCollapsedToggle && (
                <img src={DomihiveIcon} alt="DomiHive" className="h-8 w-auto" />
              )}
              {showCollapsedToggle && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 text-(--accent-color,#9F7539) transition-colors"
                  title="Expand Sidebar"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <img
                  src={isMobile && isCollapsed ? DomihiveIcon : DomihiveLogo}
                  alt="DomiHive"
                  className="h-8 w-auto object-contain"
                />
              </div>

              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 text-(--accent-color,#9F7539) transition-colors"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </>
          )}
        </div>

        <nav className="flex-1 min-h-0 py-4 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9f7539 transparent' }}>
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!isCollapsed && (
                <div className="px-6 mb-3 text-xs font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}

              <div className="space-y-1 px-3">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  if (item.comingSoon) {
                    return (
                      <div
                        key={`${section.title}-${item.label}`}
                        onMouseEnter={(e) => showTooltip(e, item.label)}
                        onMouseLeave={hideTooltip}
                        className={`group relative flex items-center gap-3 ${isCollapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'} rounded-lg transition-all duration-200
                        text-[#64748b] dark:text-gray-400 bg-white/20 dark:bg-white/[0.03]
                        ${isCollapsed ? 'mx-2' : 'mx-3'}`}
                      >
                        <Icon size={isCollapsed ? 18 : 16} className="text-[#64748b] dark:text-gray-400" />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium text-sm">{item.label}</span>
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-amber-100/70 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                              <Clock3 size={10} />
                              Soon
                            </span>
                          </>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={handleNavClick}
                      onMouseEnter={(e) => showTooltip(e, item.label)}
                      onMouseLeave={hideTooltip}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 ${isCollapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'} rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-white/40 text-[#0e1f42] dark:text-white backdrop-blur-sm'
                          : 'text-[#334155] dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10 hover:text-[#0e1f42] dark:hover:text-white backdrop-blur-sm'
                        }
                        ${isCollapsed ? 'mx-2' : 'mx-3'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={isCollapsed ? 18 : 16}
                            className={isActive ? 'text-(--accent-color,#9f7539)' : 'text-[#64748b] dark:text-gray-400'}
                          />
                          {!isCollapsed && (
                            <span className="font-medium text-sm">{item.label}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 p-5 border-t border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm">
          {!isCollapsed ? (
            <NavLink
              to="/"
              onClick={closeMobileSidebar}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200/70 dark:border-red-500/30 transition-all font-medium text-sm shadow-sm"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </NavLink>
          ) : (
            <NavLink
              to="/"
              onClick={closeMobileSidebar}
              title="Logout"
              onMouseEnter={(e) => showTooltip(e, 'Logout')}
              onMouseLeave={hideTooltip}
              className="group relative p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white border border-red-100 dark:border-red-500/30 hover:border-red-500 transition-all shadow-sm flex items-center justify-center"
            >
              <LogOut size={16} />
            </NavLink>
          )}
        </div>
      </aside>

      {tooltip.visible &&
        createPortal(
          <div
            className="hidden lg:block fixed px-2 py-1 bg-[#0e1f42] dark:bg-white dark:text-black text-white text-[10px] font-semibold rounded whitespace-nowrap z-[9999] pointer-events-none shadow-lg"
            style={{ top: tooltip.top, left: tooltip.left, transform: 'translateY(-50%)' }}
          >
            {tooltip.text}
          </div>,
          document.body
        )}
    </>
  );
};

export default AdminSidebar;
