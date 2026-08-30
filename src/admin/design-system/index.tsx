import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react';

type SurfaceProps = PropsWithChildren<HTMLAttributes<HTMLElement>>;

export function Surface({ children, className = '', ...props }: SurfaceProps) {
  return (
    <section className={`material-surface ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

export function Panel({
  title,
  status,
  children,
}: PropsWithChildren<{ title: string; status: string }>) {
  return (
    <Surface className="status-panel">
      <span className="status-panel__state">{status}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </Surface>
  );
}

export function Button({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`material-button ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}
