import React from 'react';
import { FaPlus } from 'react-icons/fa';
import './FoodCard.css';

export default function FoodCard({ name, description, price, image, isFavorite, isActive = true, rank, soldCount, FoodcardClick }) {
  return (
    /* เพิ่ม onClick={onClick} ที่ตัวกล่อง food-card */
    <div className={`food-card ${!isActive ? 'inactive' : ''}`} onClick={isActive ? FoodcardClick : undefined}>
      <div className="food-card-image-wrapper">
        <img src={image} alt={name} className="food-card-image" />
        {rank && <div className="food-card-rank-badge">อันดับ {rank}</div>}
        {!isActive && <div className="food-card-overlay"><span>หมดชั่วคราว</span></div>}
      </div>

      <div className="food-card-info">
        <h3 className="food-card-title">{name}</h3>
        <p className="food-card-desc">{description ? description.replace(/🔥/g, '').trim() : ''}</p>
        
        {soldCount !== undefined && (
          <div className="food-card-sold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', color: '#10b981'}}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            ขายแล้ว {soldCount} ชิ้น
          </div>
        )}
        
        <div className="food-card-action">
          <span className="food-card-price">{price} บาท</span>
          <button className="food-card-add-btn" disabled={!isActive}>
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
}