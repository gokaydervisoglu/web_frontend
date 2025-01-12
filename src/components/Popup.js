import React, { useEffect } from 'react';
import './Popup.css';

const Popup = ({ message, type, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`corner-popup ${type} ${isOpen ? 'show' : ''}`}>
      <div className="popup-message">{message}</div>
    </div>
  );
};

export default Popup; 