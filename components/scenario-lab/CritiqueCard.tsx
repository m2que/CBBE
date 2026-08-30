import React from 'react';
import FormattedText from '../FormattedText';

interface CritiqueCardProps {
  title: string;
  items: string[];
}

const CritiqueCard: React.FC<CritiqueCardProps> = ({ title, items }) => {
  return (
    <div className="brand-subtle-card brand-card-pad brand-no-top-stripe">
      <p className="brand-field-label">{title}</p>
      <ul className="brand-ref-list" style={{ marginTop: '12px' }}>
        {items.map((item) => (
          <li key={item} className="brand-ref-item">
            <div className="brand-ref-dot"></div>
            <p className="brand-copy-sm"><FormattedText text={item} /></p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CritiqueCard;
