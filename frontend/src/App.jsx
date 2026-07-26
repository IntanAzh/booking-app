import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AdminLayout from './components/layout/AdminLayout';
import ProviderLayout from './components/layout/ProviderLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderServices from './pages/provider/Services';
import ProviderSchedules from './pages/provider/Schedules';
import ProviderSlots from './pages/provider/Slots';
import ProviderBookings from './pages/provider/Bookings';
import ProviderPayments from './pages/provider/Payments';
import ProviderCategories from './pages/provider/Categories';
import Users from './pages/admin/Users';
import Providers from './pages/admin/Providers';
import Categories from './pages/admin/Categories';
import Services from './pages/admin/Services';
import Bookings from './pages/admin/Bookings';
import Payments from './pages/admin/Payments';
import Schedules from './pages/admin/Schedules';
import Slots from './pages/admin/Slots';
import Pricing from './pages/admin/Pricing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import CustomerLayout from './components/layout/CustomerLayout';
import CustomerBookings from './pages/customer/Bookings';
import CustomerPayments from './pages/customer/Payments';

// Helper to get correct home dashboard based on role
const getDashboardByRole = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'provider') return '/provider/dashboard';
  if (role === 'customer') return '/customer/bookings';
  return '/';
};

// Protected Route Component — redirects to login if not authenticated,
// or to the correct dashboard if user doesn't have the required role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 text-sm font-medium">Memuat data Anda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but doesn't have the required role, redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardByRole(user.role)} replace />;
  }

  return children;
};

// Redirect already-logged-in users away from /login and /register
const GuestRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getDashboardByRole(user.role)} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/my-bookings" element={<Navigate to="/customer/bookings" replace />} />
      
      {/* Protected Routes for Customer */}
      <Route 
        path="/customer" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="bookings" replace />} />
        <Route path="bookings" element={<CustomerBookings />} />
        <Route path="payments" element={<CustomerPayments />} />
        <Route path="*" element={<div className="p-8 text-slate-500">Modul Customer sedang dalam pengembangan...</div>} />
      </Route>

      {/* Protected Routes for Admin */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="providers" element={<Providers />} />
        <Route path="categories" element={<Categories />} />
        <Route path="services" element={<Services />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="payments" element={<Payments />} />
        <Route path="schedules" element={<Schedules />} />
        <Route path="slots" element={<Slots />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="*" element={<div className="p-8 text-slate-500">Modul sedang dalam pengembangan...</div>} />
      </Route>

      {/* Protected Routes for Provider */}
      <Route 
        path="/provider" 
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="categories" element={<ProviderCategories />} />
        <Route path="services" element={<ProviderServices />} />
        <Route path="schedules" element={<ProviderSchedules />} />
        <Route path="slots" element={<ProviderSlots />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="payments" element={<ProviderPayments />} />
        <Route path="*" element={<div className="p-8 text-slate-500">Modul Provider sedang dalam pengembangan...</div>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
