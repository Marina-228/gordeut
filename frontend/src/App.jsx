import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CottageDetails from './pages/CottageDetail';
import Profile from './pages/Profile';
// ИСПРАВЛЕНО: Убрали фигурные скобки и импортируем как дефолтный компонент Search
import Search from './pages/HomeSearch';
import AddCottage from './pages/AddCottage';

// 1. Импортируем провайдер
import { AuthProvider } from './context/AuthContext'; 
import { CottageProvider } from './context/CottageContext';

export default function App() {
  const [isAuth] = useState(() => !!localStorage.getItem('token'));

  const globalStyles = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  return (
    // 2. Оборачиваем все в провайдеры
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
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cottage/:id" element={<CottageDetails />} />
                {/* ИСПРАВЛЕНО: Передаем корректный компонент Search */}
                <Route path="/search" element={<Search />} />
                <Route path="/add-cottage" element={isAuth ? <AddCottage /> : <Navigate to="/login" />} />
                <Route 
                  path="/profile" 
                  element={isAuth ? <Profile /> : <Navigate to="/login" replace />} 
                />
              </Routes>
            </div>
          </div>
        </Router>
      </CottageProvider>
    </AuthProvider>
  );
}