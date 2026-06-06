// src/components/ConfirmModal.jsx
export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      margin: '0 auto'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
        maxWidth: '400px', width: '90%', textAlign: 'center'
      }}>
        <h3 style={{ marginTop: 0 }}>Подтверждение</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button 
            onClick={onCancel} 
            style={{ 
                padding: '8px 16px', 
                borderRadius: '6px', 
                border: 'none',             // Убираем границу, если она была
                backgroundColor: '#6187c5', // Голубой цвет (Tailwind blue-500)
                color: '#fff',              // Белый текст для контраста
                cursor: 'pointer' 
            }}
            >
            Отмена
            </button>
          <button onClick={onConfirm} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>Удалить</button>
        </div>
      </div>
    </div>
  );
}