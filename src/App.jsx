// src/App.jsx
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Header from './components/home/layout/Header';
import Footer from './components/home/layout/Footer';
import Hero from './components/home/Hero';
import About from './components/home/About';
import FinalCta from './components/home/FinalCta';
import Properties from './components/home/Properties';
import HowItWorks from './components/home/HowItWorks';
import OurSecurity from './components/home/OurSecurity';
import SignupPage from './components/auth/pages/SignupPage';
import LoginPage from './components/auth/pages/LoginPage';
import RentOverview from './components/dashboard/rent/pages/RentOverview';
import RentBrowse from './components/dashboard/rent/pages/RentBrowse';
import DashboardLayout from './components/dashboard/layout/DashboardLayout';
import RentApplications from './components/dashboard/rent/pages/RentApplications';
import ApplicationStartPage from './components/dashboard/rent/pages/ApplicationStartPage';
import ApplicationPaymentPage from './components/dashboard/rent/pages/ApplicationPaymentPage';
import ApplicationTrackPage from './components/dashboard/rent/pages/ApplicationTrackPage';
import MyProperties from './components/dashboard/rent/pages/MyProperties';
import PropertyDashboard from './components/dashboard/rent/pages/PropertyDashboard';
import PropertyPayments from './components/dashboard/rent/pages/PropertyPayments';
import PropertyVacate from './components/dashboard/rent/pages/PropertyVacate';
import MaintenancePage from './components/dashboard/rent/pages/MaintenancePage';
import MaintenanceDetailPage from './components/dashboard/rent/pages/MaintenanceDetailPage';
import MaintenancePolicyPage from './components/dashboard/rent/pages/MaintenancePolicyPage';
import PaymentsPage from './components/dashboard/rent/pages/PaymentsPage';
import MessagesPage from './components/dashboard/rent/pages/MessagesPage';
import SettingsPage from './components/dashboard/pages/SettingsPage';
import FavoritesPage from './components/dashboard/rent/pages/FavoritesPage';
import AdminLayout from './components/admin/layout/AdminLayout';
import AdminDashboard from './components/admin/pages/AdminDashboard';
import AdminProperties from './components/admin/pages/AdminProperties';
import AdminLocationsFilters from './components/admin/pages/AdminLocationsFilters';
import AdminInspectionSlots from './components/admin/pages/AdminInspectionSlots';
import AdminInspections from './components/admin/pages/AdminInspections';
import AdminApplications from './components/admin/pages/AdminApplications';
import AdminTenants from './components/admin/pages/AdminTenants';
import AdminContentPolicies from './components/admin/pages/AdminContentPolicies';
import AdminAddNewProperty from './components/admin/pages/AdminAddNewProperty';
import './App.css';
import NotFound from './components/NotFound';
import AdminPropertyDetails from './components/admin/pages/AdminPropertyDetails';
import AdminClients from './components/admin/pages/AdminClients';
import AdminClientDetail from './components/admin/pages/AdminClientDetail';
import AdminClientPortfolio from './components/admin/pages/AdminClientPortfolio';
import AdminPayments from './components/admin/pages/AdminPayments';
import AdminTenantDetails from "./components/admin/pages/AdminTenantDetails";
import AdminMaintenance from './components/admin/pages/AdminMaintenance';
import AdminMaintenanceDetails from './components/admin/pages/AdminMaintenanceDetails';
import AdminReports from './components/admin/pages/AdminReports';
import AdminSettings from './components/admin/pages/AdminSettings';
import AdminCreateContract from './components/admin/pages/AdminCreateContract';
import AdminPaymentDetails from './components/admin/pages/AdminPaymentDetails';
import { useApplications } from './components/dashboard/rent/contexts/ApplicationsContext';
import { applicationStageGuards } from './components/dashboard/rent/contexts/JourneyContext';
import { useProperties } from './components/dashboard/rent/contexts/PropertiesContext';

const RequireApplicationAccess = ({ mode, children }) => {
  const { applicationId } = useParams();
  const { applications } = useApplications();
  const application = applications.find((app) => app.id === applicationId);

  if (!application) {
    return <Navigate to="/dashboard/rent/applications" replace />;
  }

  const status = application.status;
  if (mode === 'start' && !applicationStageGuards.canStart.has(status)) {
    if (applicationStageGuards.canTrack.has(status)) {
      return <Navigate to={`/dashboard/rent/applications/${applicationId}/track`} replace />;
    }
    return <Navigate to="/dashboard/rent/applications" replace />;
  }

  if (mode === 'payment' && !applicationStageGuards.canPay.has(status)) {
    if (applicationStageGuards.canTrack.has(status)) {
      return <Navigate to={`/dashboard/rent/applications/${applicationId}/track`} replace />;
    }
    if (applicationStageGuards.canStart.has(status)) {
      return <Navigate to={`/dashboard/rent/applications/${applicationId}/start`} replace />;
    }
    return <Navigate to="/dashboard/rent/applications" replace />;
  }

  if (mode === 'track' && !applicationStageGuards.canTrack.has(status)) {
    if (applicationStageGuards.canStart.has(status)) {
      return <Navigate to={`/dashboard/rent/applications/${applicationId}/start`} replace />;
    }
    return <Navigate to="/dashboard/rent/applications" replace />;
  }

  return children;
};

const RequirePropertyAccess = ({ children }) => {
  const { propertyId } = useParams();
  const { properties } = useProperties();
  const exists = properties.some((property) => property.propertyId === propertyId);
  if (!exists) {
    return <Navigate to="/dashboard/rent/my-properties" replace />;
  }
  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Homepage with Header and Footer */}
        <Route path="/" element={
          <>
            <Header />
            <main>
              <Hero />
              <About />
              <Properties />
              <HowItWorks />
              <OurSecurity />
              <FinalCta />
            </main>
            <Footer />
          </>
        } />

        {/* Not found pages for testing */}
        <Route path='*' element={<NotFound />} />

        {/* Auth pages without Header/Footer */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="locations-filters" element={<AdminLocationsFilters />} />
          <Route path="inspection-slots" element={<AdminInspectionSlots />} />
          <Route path="inspections" element={<AdminInspections />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="tenants" element={<AdminTenants />} />
          <Route path="tenants/:tenantId" element={<AdminTenantDetails />} />
          <Route path="content-policies" element={<AdminContentPolicies />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="clients/:clientId" element={<AdminClientDetail />} />
          <Route path="clients/:clientId/portfolio" element={<AdminClientPortfolio />} />
          <Route path="clients/:clientId/contracts/new" element={<AdminCreateContract />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="payments/:paymentId" element={<AdminPaymentDetails />} />
          <Route path="maintenance" element={<AdminMaintenance />} />
          <Route path="maintenance/:requestId" element={<AdminMaintenanceDetails />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />

          {/* Route for adding new properties */}
          <Route path="properties/add-new-property" element={<AdminAddNewProperty />} />
          {/* Route for property details */}
          <Route path="properties/unit/:unitId" element={<AdminPropertyDetails />} />
        </Route>


        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="rent/overview" replace />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="rent">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<RentOverview />} />
            <Route path="browse" element={<RentBrowse />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="applications" element={<RentApplications />} />
            <Route
              path="applications/:applicationId/start"
              element={(
                <RequireApplicationAccess mode="start">
                  <ApplicationStartPage />
                </RequireApplicationAccess>
              )}
            />
            <Route
              path="applications/:applicationId/payment"
              element={(
                <RequireApplicationAccess mode="payment">
                  <ApplicationPaymentPage />
                </RequireApplicationAccess>
              )}
            />
            <Route
              path="applications/:applicationId/track"
              element={(
                <RequireApplicationAccess mode="track">
                  <ApplicationTrackPage />
                </RequireApplicationAccess>
              )}
            />
            <Route path="my-properties" element={<MyProperties />} />
            <Route
              path="my-properties/:propertyId"
              element={(
                <RequirePropertyAccess>
                  <PropertyDashboard />
                </RequirePropertyAccess>
              )}
            />
            <Route
              path="my-properties/:propertyId/payments"
              element={(
                <RequirePropertyAccess>
                  <PropertyPayments />
                </RequirePropertyAccess>
              )}
            />
            <Route
              path="my-properties/:propertyId/vacate"
              element={(
                <RequirePropertyAccess>
                  <PropertyVacate />
                </RequirePropertyAccess>
              )}
            />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="maintenance/:ticketId" element={<MaintenanceDetailPage />} />
            <Route path="maintenance/policy" element={<MaintenancePolicyPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
