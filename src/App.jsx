import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CoursesProvider } from './context/CoursesContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import ActiveStudents from './pages/ActiveStudents';
import Analytics from './pages/Analytics';
import Finance from './pages/Finance';
import Leads from './pages/Leads';
import Courses from './pages/Courses';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"       element={<Dashboard />} />
        <Route path="customers"       element={<Customers />} />
        <Route path="active-students" element={<ActiveStudents />} />
        <Route path="analytics"       element={<Analytics />} />
        <Route path="finance"         element={<Finance />} />
        <Route path="leads"           element={<Leads />} />
        <Route path="courses"         element={<Courses />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CoursesProvider>
          <AppRoutes />
        </CoursesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
