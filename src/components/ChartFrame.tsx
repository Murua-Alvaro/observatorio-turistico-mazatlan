import type { ReactNode } from 'react';

export const tooltipStyle = {
  background: '#071b1b',
  border: '1px solid rgba(255,255,255,.12)',
  borderRadius: 12,
  color: '#f4f7f5',
  boxShadow: '0 12px 38px rgba(0,0,0,.18)',
};

export function ChartFrame({ children, large = false }: { children: ReactNode; large?: boolean }) {
  return <div className={`chart ${large ? 'chart--large' : ''}`}>{children}</div>;
}
