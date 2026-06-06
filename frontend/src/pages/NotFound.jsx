import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      textAlign: 'center',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '120px', margin: 0, color: '#598850' }}>404</h1>
      <h2 style={{ fontSize: '28px', margin: '10px 0' }}>Упс! Страница не найдена</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Кажется, вы перешли по несуществующей ссылке.
      </p>
      
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '12px 30px',
          fontSize: '16px',
          background: '#598850',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background 0.3s'
        }}
        onMouseOver={(e) => e.target.style.background = '#476d3f'}
        onMouseOut={(e) => e.target.style.background = '#598850'}
      >
        Вернуться на главную
      </button>
    </div>
  );
}