import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  value: string;
  change?: string;
  changeTone?: 'positive' | 'negative' | 'neutral';
  detail: string;
  icon?: ReactNode;
};

export function Metric({ eyebrow, value, change, changeTone = 'neutral', detail, icon }: Props) {
  return (
    <article className="metric">
      <div className="metric__top">
        <span className="metric__eyebrow">{eyebrow}</span>
        {icon ? <span className="metric__icon">{icon}</span> : null}
      </div>
      <div className="metric__value">{value}</div>
      <div className="metric__footer">
        {change ? <span className={`metric__change metric__change--${changeTone}`}>{change}</span> : null}
        <span>{detail}</span>
      </div>
    </article>
  );
}
