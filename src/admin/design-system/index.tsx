import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
} from 'react';

type SurfaceProps = PropsWithChildren<HTMLAttributes<HTMLElement> & { tone?: 'default' | 'quiet' | 'cream' }>;

export function Surface({ children, className = '', tone = 'default', ...props }: SurfaceProps) {
  return (
    <section className={`material-surface material-surface--${tone} ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <button className={`material-button material-button--${variant} ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}

export function ActionLink({
  children,
  className = '',
  variant = 'primary',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <a className={`material-button material-button--${variant} ${className}`.trim()} {...props}>
      {children}
    </a>
  );
}

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'photo' | 'design' | 'good' | 'warning' }>) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <p className="admin-kicker">{kicker}</p>
        <h1>{title}</h1>
        {description && <p className="admin-page-header__description">{description}</p>}
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </header>
  );
}

export function EmptyState({ title, children, action }: PropsWithChildren<{ title: string; action?: ReactNode }>) {
  return (
    <Surface className="empty-state" tone="quiet">
      <p className="admin-kicker">Nothing here yet</p>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </Surface>
  );
}

export function LoadingState() {
  return (
    <main className="admin-loading" aria-busy="true" aria-label="Loading the CMS">
      <span className="admin-loading__mark">loew.fi</span>
      <div className="admin-loading__line" />
      <p>Opening your workspace…</p>
    </main>
  );
}
