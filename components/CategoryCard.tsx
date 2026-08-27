import React from 'react';
import type { CBBECategory } from '../types';

interface CategoryCardProps {
  title: string;
  level: number;
  data: CBBECategory;
}

const levelColors = {
  1: 'var(--accent)',
  2: 'var(--accent-2)',
  3: 'var(--accent-4)',
  4: 'var(--accent-5)',
};

const ScoreCircle: React.FC<{ score: number; level: number }> = ({ score, level }) => {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  const color = levelColors[level as keyof typeof levelColors] || 'var(--muted)';

  return (
    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
      <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%' }}>
        <circle
          strokeWidth="4"
          stroke="rgba(79, 70, 229, 0.14)"
          fill="transparent"
          r="28"
          cx="30"
          cy="30"
        />
        <circle
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r="28"
          cx="30"
          cy="30"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: '1.1rem',
          fontWeight: 800,
          color: 'var(--ink)'
        }}
      >
        {score}
      </span>
    </div>
  );
};

const CategoryCard: React.FC<CategoryCardProps> = ({ title, level, data }) => {
  const color = levelColors[level as keyof typeof levelColors] || 'var(--accent)';

  return (
    <div className="brand-subtle-card brand-category-card" style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <div style={{ height: '4px', background: color, flexShrink: 0 }}></div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '999px', background: color }}></span>
          <h3 className="brand-heading" style={{ fontSize: '1.2rem' }}>{title}</h3>
        </div>
        <ScoreCircle score={data.score} level={level} />
      </div>
      <div style={{ flexGrow: 1, borderTop: '1px solid var(--line)', padding: '16px' }}>
        <p className="brand-microcopy" style={{ marginBottom: '8px' }}>Score drivers</p>
        <p className="brand-copy-sm">{data.analysis}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
