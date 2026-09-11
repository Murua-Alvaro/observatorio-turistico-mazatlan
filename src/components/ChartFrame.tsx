import type { ReactNode } from 'react';

export const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #b8c2ca',
  borderRadius: 2,
  color: '#17212b',
  boxShadow: '0 6px 18px rgba(24,36,48,.10)',
  fontSize: 11,
};

export function ChartFrame({ children, large = false }: { children: ReactNode; large?: boolean }) {
  return <div className={`chart ${large ? 'chart--large' : ''}`}>{children}</div>;
}
