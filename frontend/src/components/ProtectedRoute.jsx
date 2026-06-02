import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // ВАЖНО: Если данные еще грузятся, НЕ перекидываем на логин, а показываем загрузку
  if (loading) {
    return <div>Загрузка...</div>; 
  }

  // Если загрузка закончилась и пользователь НЕ авторизован — тогда на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;