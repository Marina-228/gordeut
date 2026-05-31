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
export default function App() {
  const globalStyles = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  return (
    <AuthProvider>
      <CottageProvider> 
        <Router>
          <div style={{ 
            ...globalStyles,
            display: 'flex', 
            width: '100vw',       
            height: '100vh',      
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: '#fff'
          }}>
            <Sidebar />
            
            <div style={{ 
              flexGrow: 1,          
              height: '100%',       
              display: 'flex',      
              flexDirection: 'column',
              background: '#f9f9f9',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}>
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cottage/:id" element={<CottageDetails />} />
                <Route path="/search" element={<Search />} />
                
                {/* Приватные маршруты (оборачиваем в ProtectedRoute) */}
                <Route path="/my-bookings" element={
                  <ProtectedRoute><MyBookings /></ProtectedRoute>
                } />
                <Route path="/add-cottage" element={
                  <ProtectedRoute><AddCottage /></ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
              </Routes>
            </div>
          </div>
        </Router>
      </CottageProvider>
    </AuthProvider>
  );
}