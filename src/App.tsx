import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts & Pages
import Layout from './components/Layout';
import Home from './pages/Home';
import Wearables from './pages/Wearables';
import EducationHub from './pages/EducationHub';
import RiskAssessment from './pages/RiskAssessment';
import Telemedicine from './pages/Telemedicine';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorProfile from './pages/DoctorProfile';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';

// Contexts & Auth
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function AppRoutes() {
  const { user } = useAuth() as any;

  useEffect(() => {
    if (user) {
      console.log("Current Logged In User:", user.displayName || user.email);
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="wearables" element={<Wearables />} />
        <Route path="education" element={<EducationHub />} />
        <Route path="assessment" element={<RiskAssessment />} />
        <Route path="telemedicine" element={<Telemedicine />} />
        
        {/* Only show Login/Register if user is NOT logged in */}
        <Route path="login" element={user ? <Navigate to="/profile" /> : <Login />} />
        <Route path="register" element={user ? <Navigate to="/profile" /> : <Register />} />
        
        <Route path="doctors/:id" element={<DoctorProfile />} />
        <Route path="auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes */}
        <Route path="profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppRoutes />
        <Toaster position="top-center" richColors />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;