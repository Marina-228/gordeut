import { useState } from 'react';
import API from '../api/axios';

export const HomeSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Предполагаем, что у вас будет такой маршрут на бэкенде
      // Или можно фильтровать текущий список коттеджей
      const response = await API.get(`/cottages?search=${query}`);
      setResults(response.data);
    } catch (err) {
      console.error("Ошибка поиска:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Поиск домиков</h1>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите название или локацию..."
          style={{ width: '70%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', marginLeft: '10px', cursor: 'pointer' }}>
          Найти
        </button>
      </form>

      {loading && <p>Ищем...</p>}

      <div style={{ display: 'grid', gap: '20px' }}>
        {results.length > 0 ? (
          results.map(c => <div key={c.id} style={{ padding: '20px', border: '1px solid #ddd' }}>{c.title}</div>)
        ) : (
          <p>Введите запрос для поиска</p>
        )}
      </div>
    </div>
  );
};

// В конце файла HomeSearch.jsx
export default HomeSearch; // Добавьте эту строку, если её нет