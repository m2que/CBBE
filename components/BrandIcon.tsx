import React from 'react';

type BrandIconName = 'icon-marketlearn' | 'icon-cbbe' | 'icon-bpm' | 'icon-bea';

interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  name: BrandIconName;
}

const BrandIcon: React.FC<BrandIconProps> = ({ name, style, ...props }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', ...style }} {...props}>
    <use href={`/assets/marketlearn-icons.svg#${name}`}></use>
  </svg>
);

export default BrandIcon;
