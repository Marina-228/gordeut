import { useEffect } from 'react';

// Убрали использование isSuccess для иконки, но оставили логику цвета
export default function Notification({ message, onClose, isSuccess = false }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = isSuccess ? '#33754b' : '#ef4444';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeInOverlay 0.3s ease'
    }}>
      <div style={{
        backgroundColor: bgColor,
        color: '#ffffff',
        padding: '20px 40px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif',
        fontSize: '16px',
        fontWeight: '600',
        animation: 'scaleIn 0.3s ease-out',
        textAlign: 'center'
      }}>
        {message}
      </div>

      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { 
          from { transform: scale(0.9); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
      `}</style>
    </div>
  );
}