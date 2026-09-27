import React, { useState, useEffect, useCallback } from 'react';
import { FaFire } from 'react-icons/fa';
import FoodCard from '../../components/FoodCard/FoodCard';
import './Home.css';

import { API_BASE, resolveImage } from '../../utils/api';

export default function Home({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/menus`).then(res => res.json()),
      fetch(`${API_BASE}/api/menus/bestsellers`).then(res => res.json())
    ])
      .then(([menusData, bestSellersData]) => {
        setProducts(menusData);
        setBestSellers(bestSellersData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  // Re-fetch data every time this component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดเมนู...</div>;

  return (
    <div className="home-container">
      
      {bestSellers && bestSellers.length > 0 && (
        <div className="best-sellers-section" style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>สินค้าขายดี</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>ยอดจำหน่ายสะสมประจำเดือนนี้</p>
          </div>
          
          <div className="food-grid">
            {bestSellers.map((item, index) => (
              <FoodCard
                key={`best-${item.menu_id}`}
                name={item.name}
                description={item.description}
                price={Number(item.price)}
                image={resolveImage(item.image)}
                isActive={true}
                rank={index + 1}
                soldCount={item.sold}
                FoodcardClick={() => onSelectProduct(item.menu_id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="category-badge-wrapper" style={{ marginTop: bestSellers.length > 0 ? '20px' : '0' }}>
        <span className="category-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          เมนูทั้งหมด
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
            isActive={item.is_active}
            FoodcardClick={() => item.is_active ? onSelectProduct(item.menu_id) : null}
          />
        ))}
      </div>
    </div>
  );
}