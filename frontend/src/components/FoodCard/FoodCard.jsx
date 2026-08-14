import React from 'react';
import { FaPlus } from 'react-icons/fa';
import './FoodCard.css';

export default function FoodCard({ name, description, price, image, isFavorite, isActive = true, FoodcardClick }) {
  return (
    /* เพิ่ม onClick={onClick} ที่ตัวกล่อง food-card */
    <div className={`food-card ${!isActive ? 'inactive' : ''}`} onClick={isActive ? FoodcardClick : undefined}>
      <div className="food-card-image-wrapper">
        <img src={image} alt={name} className="food-card-image" />
        {!isActive && <div className="food-card-overlay"><span>หมดชั่วคราว</span></div>}
      </div>

      <div className="food-card-info">
        <h3 className="food-card-title">{name}</h3>
        <p className="food-card-desc">{description ? description.replace(/🔥/g, '').trim() : ''}</p>
        
        <div className="food-card-action">
          <span className="food-card-price">฿{price}</span>
          <button className="food-card-add-btn" disabled={!isActive}>
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
}