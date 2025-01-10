import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faInfoCircle, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: faCheckCircle,
    error: faExclamationCircle,
    info: faInfoCircle
  };

  return (
    <div className={`toast-container ${type}`}>
      <div className="toast-content">
        <FontAwesomeIcon icon={icons[type]} className="toast-icon" />
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default Toast; 