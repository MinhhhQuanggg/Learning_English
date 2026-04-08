import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import LearningPath from './pages/LearningPath';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import LessonDetail from './pages/LessonDetail';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import Battle from './pages/Battle';
import FeedbackWidget from './components/FeedbackWidget';

function App() {
  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <FeedbackWidget />
        <div style={{ flex: 1 }}>
          <Routes>
            {/* Các route công khai */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Các route được bảo vệ */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning-path"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <LearningPath />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Profile />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <LessonDetail />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/battle"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Battle />
                  <Footer />
                </ProtectedRoute>
              }
            />

            {/* Route riêng cho Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Navbar />
                  <AdminDashboard />
                  <Footer />
                </AdminRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
