import React from 'react';
import { Heart } from 'lucide-react';
import './Loader.css';

interface LoaderProps {
  className?: string;
  style?: React.CSSProperties;
}

const Loader: React.FC<LoaderProps> = ({ className = '', style }) => {
  return (
    <div className={`spinner-wrapper ${className}`} style={style}>
      <div className="med-loader-container">
        <div className="classic-spinner-ring"></div>
        <div className="heart-center-overlay">
          <Heart size={18} className="inner-medical-heart" fill="#4da4fc" color="#4da4fc" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default Loader;
