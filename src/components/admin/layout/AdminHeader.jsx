import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
  Shield,
  Home,
  Building2,
  Hotel,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

const notifications = [{}, {}];

const dropdownItems = [
  { label: 'Profile', to: '/admin/profile', icon: User },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
  { label: 'Logout', to: '/', icon: LogOut },
];

const AdminHeader = ({ toggleSidebar, isMobile }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDashboardSwitcher, setShowDashboardSwitcher] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.body.dataset.adminTheme === 'dark';
  });
  const dropdownRef = useRef(null);
  const switcherRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumb = useMemo(() => {
    const path = location.pathname;
    if (path === '/admin') return 'Admin Dashboard';
    if (path.includes('/clients')) return 'Clients';
    if (path.includes('/contracts')) return 'Contracts';
    if (path.includes('/properties')) return 'Properties';
    if (path.includes('/units')) return 'Units';
    if (path.includes('/locations-filters')) return 'Locations & Filters';
    if (path.includes('/inspection-slots')) return 'Inspection Slots';
    if (path.includes('/inspections')) return 'Inspection Bookings';
    if (path.includes('/applications')) return 'Applications';
    if (path.includes('/tenants')) return 'Tenants';
    if (path.includes('/content-policies')) return 'Content & Policies';
    if (path.includes('/settings')) return 'Settings';
    return 'Admin';
  }, [location.pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.dataset.adminTheme = 'dark';
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.body.dataset.adminTheme = 'light';
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const insideProfile = dropdownRef.current && dropdownRef.current.contains(event.target);
      const insideSwitcher = switcherRef.current && switcherRef.current.contains(event.target);

      if (!insideProfile) {
        setDropdownOpen(false);
      }

      if (!insideSwitcher) {
        setShowDashboardSwitcher(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.body.dataset.adminTheme = next ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('admin-theme', next ? 'dark' : 'light');
    } catch {
      // no-op
    }
  };

  const adminDashboards = [
    { id: 'rent', name: 'Rent Admin', icon: Home, enabled: true, path: '/admin' },
    { id: 'buy', name: 'Buy Admin', icon: ShoppingBag, enabled: false, path: '/admin' },
    { id: 'commercial', name: 'Commercial Admin', icon: Building2, enabled: false, path: '/admin' },
    { id: 'shortlet', name: 'Shortlet Admin', icon: Hotel, enabled: false, path: '/admin' },
  ];

  const handleSwitchDashboard = (dashboard) => {
    if (!dashboard.enabled) return;
    setShowDashboardSwitcher(false);
    navigate(dashboard.path);
  };

  const handleCleanSlate = () => {
    const confirmed = window.confirm(
      'This will delete all DomiHive local data (admin + user journey) on this browser. Continue?'
    );
    if (!confirmed) return;

    const localKeys = Object.keys(window.localStorage).filter((key) => key.startsWith('domihive_'));
    localKeys.forEach((key) => window.localStorage.removeItem(key));

    const sessionKeys = Object.keys(window.sessionStorage).filter((key) => key.startsWith('domihive_'));
    sessionKeys.forEach((key) => window.sessionStorage.removeItem(key));

    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch (_error) {
      // ignore
    }

    window.setTimeout(() => window.location.reload(), 50);
  };

  return (
    <header className="dashboard-header bg-white/80 dark:bg-[#111827]/75 border-b border-gray-200 dark:border-white/10 px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-[1200] backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-4">
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
              title="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">Admin</span>
            <i className="fas fa-chevron-right text-xs text-gray-400"></i>
            <span className="font-semibold text-gray-900 dark:text-white">{breadcrumb}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={handleCleanSlate}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 hover:border-red-400 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Clean Slate"
          >
            <Trash2 size={14} />
            <span className="text-sm font-semibold hidden lg:inline">Clean Slate</span>
          </button>

          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => {
                setShowDashboardSwitcher((prev) => !prev);
                setDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            >
              <Home size={16} className="text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden lg:inline">Rent Admin</span>
              <ChevronDown
                size={14}
                className={`text-gray-500 dark:text-gray-400 transition-transform ${showDashboardSwitcher ? 'rotate-180' : ''}`}
              />
            </button>

            {showDashboardSwitcher && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111827] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 py-2 z-[1300]">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Switch Dashboard
                </div>
                {adminDashboards.map((dashboard) => (
                  <button
                    key={dashboard.id}
                    onClick={() => handleSwitchDashboard(dashboard)}
                    disabled={!dashboard.enabled}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      dashboard.enabled
                        ? 'hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'
                        : 'opacity-60 cursor-not-allowed text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <dashboard.icon size={16} />
                    <span className="flex-1 font-medium">{dashboard.name}</span>
                    {!dashboard.enabled && (
                      <span className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-white/10">Coming Soon</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors relative">
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notifications.length}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setDropdownOpen((prev) => !prev);
                setShowDashboardSwitcher(false);
              }}
              className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-(--accent-color,#9f7539) text-white flex items-center justify-center font-semibold">
                S
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Super Admin</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Full access</div>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-500 dark:text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111827] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 py-2 z-[1300]">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10">
                  <div className="font-semibold text-gray-900 dark:text-white">Super Admin</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Shield size={12} />
                    Full access
                  </div>
                </div>

                <div className="py-2">
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => {
                        setDropdownOpen(false);
                        if (item.label === 'Logout') {
                          navigate('/login');
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      <item.icon
                        size={16}
                        className={item.label === 'Logout' ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}
                      />
                      <span className={item.label === 'Logout' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-200 font-medium'}>
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
