import React, { useState, useEffect, useCallback } from 'react';
import { FaFire, FaSearch, FaTimes } from 'react-icons/fa';
import FoodCard from '../../components/FoodCard/FoodCard';
import './Home.css';

import { API_BASE, resolveImage } from '../../utils/api';

export default function Home({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

  // Filter products based on search query
  const filteredProducts = products.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดเมนู...</div>;

  return (
    <div className="home-container">
      
      {/* Search Bar */}
      <div className={`home-search-container ${isSearchFocused ? 'focused' : ''}`}>
        <FaSearch className="home-search-icon" />
        <input
          type="text"
          className="home-search-input"
          placeholder="ค้นหาเมนู..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery && (
          <button 
            className="home-search-clear"
            onClick={() => setSearchQuery('')}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Best Sellers - hide when searching */}
      {!searchQuery && bestSellers && bestSellers.length > 0 && (
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

      <div className="category-badge-wrapper" style={{ marginTop: !searchQuery && bestSellers.length > 0 ? '20px' : '0' }}>
        <span className="category-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {searchQuery ? `ผลการค้นหา "${searchQuery}"` : 'เมนูทั้งหมด'}
        </span>
        {searchQuery && (
          <span style={{ marginLeft: '12px', fontSize: '14px', color: '#6b7280' }}>
            พบ {filteredProducts.length} รายการ
          </span>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="food-grid">
          {filteredProducts.map((item) => (
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
      ) : (
        <div className="home-no-results">
          <FaSearch style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 4px 0' }}>ไม่พบเมนูที่ค้นหา</p>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>ลองค้นหาด้วยคำอื่น</p>
        </div>
      )}
    </div>
  );
}