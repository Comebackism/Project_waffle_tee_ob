import React, { useState, useEffect, useCallback } from 'react';
import { FaFire } from 'react-icons/fa';
import FoodCard from '../../components/FoodCard/FoodCard';
import './Home.css';

const API_BASE = 'http://localhost:5000';

export default function Home({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/menus`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  // Re-fetch menus every time this component mounts (navigating back refreshes data)
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Resolve image URL: if it starts with '/' it's a local backend path
  const resolveImage = (pic) => {
    if (!pic) return 'https://via.placeholder.com/300';
    if (pic.startsWith('http')) return pic;
    return `${API_BASE}${pic}`;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดเมนู...</div>;

  return (
    <div className="home-container">
      <div className="category-badge-wrapper">
        <span className="category-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          วาฟเฟิลยอดฮิต
        </span>
      </div>

      <div className="food-grid">
        {products.map((item) => (
          <FoodCard
            key={item.menu_id}
            name={item.name}
            description={item.description}
            price={Number(item.price)}
            image={resolveImage(item.Picture)}
            isFavorite={item.is_favorite}
            FoodcardClick={() => onSelectProduct(item.menu_id)}
          />
        ))}
      </div>
    </div>
  );
}