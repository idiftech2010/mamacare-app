import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Downloads from './pages/Downloads';
import Telemedicine from './pages/Telemedicine';
import Wearables from './pages/Wearables';
import EducationHub from './pages/EducationHub';
import RiskAssessment from './pages/RiskAssessment';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import DoctorProfile from './pages/DoctorProfile';
import AuthCallback from './pages/AuthCallback';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="chat" element={<Chat />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="telemedicine" element={<Telemedicine />} />
            <Route path="wearables" element={<Wearables />} />
            <Route path="education" element={<EducationHub />} />
            <Route path="assessment" element={<RiskAssessment />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="doctors/:id" element={<DoctorProfile />} />
            
            {/* Auth Callback */}
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
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="top-center" richColors />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
