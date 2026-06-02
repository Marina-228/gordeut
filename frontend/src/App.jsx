import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; 
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Register from './pages/Register';
import CottageDetails from './pages/CottageDetail';
import Search from './pages/HomeSearch';
import AddCottage from "./pages/AddCottage"; // Оставляем только этот, если он существует
import Profile from './pages/Profile';

import { AuthProvider } from './context/AuthContext'; 
import { CottageProvider } from './context/CottageContext';
import './calendar.css';
// ... ваши импорты

export default function App() {
  return (
    <AuthProvider>
      <CottageProvider> 
        <Router>
          <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#fff' }}>
            <Sidebar />
            
            <main style={{ flexGrow: 1, height: '100%', overflowY: 'auto', background: '#f9f9f9' }}>
              <Routes>
                {/* Публичные */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cottage/:id" element={<CottageDetails />} />
                <Route path="/search" element={<Search />} />
                
                {/* Приватные */}
                <Route path="/my-bookings" element={
                  <ProtectedRoute><MyBookings /></ProtectedRoute>
                } />
                <Route path="/add-cottage" element={
                  <ProtectedRoute><AddCottage /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                
                {/* Редирект на главную, если путь не найден */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CottageProvider>
    </AuthProvider>
  );
}