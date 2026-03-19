// src/components/dashboard/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard } from '../../../context/DashboardContext';
import Header from './Header';
import Sidebar from './Sidebar';
import { ApplicationsProvider } from '../rent/contexts/ApplicationsContext';
import { PropertiesProvider } from '../rent/contexts/PropertiesContext';
import { MaintenanceProvider } from '../rent/contexts/MaintenanceContext';
import { PaymentsProvider } from '../rent/contexts/PaymentsContext';
import { MessagesProvider } from '../rent/contexts/MessagesContext';
import { JourneyProvider } from '../rent/contexts/JourneyContext';

const DashboardLayout = () => {
  const [sidebarState, setSidebarState] = useState('expanded'); // 'expanded' | 'collapsed'
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const { currentDashboard } = useDashboard();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle responsive sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarState('collapsed');
      } else {
        const savedState = localStorage.getItem('domihive_sidebar_state');
        if (savedState && ['expanded', 'collapsed'].includes(savedState)) {
          setSidebarState(savedState);
        } else {
          setSidebarState('expanded');
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save sidebar state to localStorage when it changes (desktop only)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('domihive_sidebar_state', sidebarState);
    }
  }, [sidebarState, isMobile]);

  useEffect(() => {
    document.body.classList.add('dashboard-themed');
    return () => {
      document.body.classList.remove('dashboard-themed');
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarState((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'));
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarState('collapsed');
    }
  };

  // Calculate main content margin based on sidebar state
  const getMainMargin = () => {
    if (isMobile) return 'ml-0';

    if (sidebarState === 'expanded') return 'ml-64'; // w-64 = 256px
    return 'ml-20'; // w-20 = 80px when collapsed
  };

  return (
    <ApplicationsProvider>
      <PropertiesProvider>
        <MaintenanceProvider>
          <PaymentsProvider>
            <MessagesProvider>
              <JourneyProvider>
                <div className="dashboard-layout flex h-screen overflow-hidden bg-(--light-gray)">
                  {/* Sidebar - fixed position */}
                  <Sidebar
                    sidebarState={sidebarState}
                    toggleSidebar={toggleSidebar}
                    closeMobileSidebar={closeMobileSidebar}
                    isMobile={isMobile}
                    currentDashboard={currentDashboard}
                  />

                  {/* Main Content Area */}
                  <div className={`dashboard-main flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${getMainMargin()}`}>
                    {/* Header - fixed at top */}
                    <Header
                      toggleSidebar={toggleSidebar}
                      isMobile={isMobile}
                      sidebarState={sidebarState}
                    />

                    {/* Content Area - scrollable */}
                    <main className="dashboard-content flex-1 overflow-auto">
                      <Outlet />
                    </main>
                  </div>
                </div>
              </JourneyProvider>
            </MessagesProvider>
          </PaymentsProvider>
        </MaintenanceProvider>
      </PropertiesProvider>
    </ApplicationsProvider>
  );
};

export default DashboardLayout;
