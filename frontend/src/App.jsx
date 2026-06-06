import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; 
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Register from './pages/Register';
import CottageDetails from './pages/CottageDetail';
import Search from './pages/HomeSearch';
import AddCottage from "./pages/AddCottage";
import Profile from './pages/Profile';
import Settings from './pages/Settings'; // Импортируем страницу настроек

import { AuthProvider } from './context/AuthContext'; 
import { CottageProvider } from './context/CottageContext';
import './calendar.css';
import NotFound from './pages/NotFound'; // импортируйте ваш новый компонент

export default function App() {
  return (
    <AuthProvider>
      <CottageProvider> 
        <Router>
          <div style={{ 
  display: 'flex', 
  width: '100vw', 
  height: '100vh', 
  overflow: 'hidden', 
  background: '#fff' 
}}>
  <Sidebar />
  
  <main style={{ 
    flexGrow: 1,           // <--- ДОБАВИТЬ ЭТО: занимает всё свободное место
    height: '100%', 
    overflowY: 'auto', 
    background: '#f9f9f9',
    display: 'flex',            
    flexDirection: 'column',    
    alignItems: 'center',   // Центрирует контент по горизонтали внутри этой области
    overflowX: 'hidden'
  }}>
    <div style={{ 
      
      width: '100%', 
      maxWidth: '1200px', // Ограничиваем ширину, чтобы не растягивалось на весь экран
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
              <Routes>
  {/* Публичные маршруты */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/cottage/:id" element={<CottageDetails />} />
  <Route path="/search" element={<Search />} />
  
  {/* Приватные маршруты */}
  <Route path="/my-bookings" element={
    <ProtectedRoute><MyBookings /></ProtectedRoute>
  } />
  <Route path="/add-cottage" element={
    <ProtectedRoute><AddCottage /></ProtectedRoute>
  } />
  <Route path="/profile" element={
    <ProtectedRoute><Profile /></ProtectedRoute>
  } />
  <Route path="/settings" element={
    <ProtectedRoute><Settings /></ProtectedRoute>
  } />
  
  {/* ИСПРАВЛЕНО: Оставляем только один обработчик для всех несуществующих путей */}
  <Route path="*" element={<NotFound />} />
</Routes>
              </div>
            </main>
          </div>
        </Router>
      </CottageProvider>
    </AuthProvider>
  );
}