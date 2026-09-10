import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, subtitle, action, children, className = '' }: Props) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel__header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <div className="panel__action">{action}</div> : null}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}
