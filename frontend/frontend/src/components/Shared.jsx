import { AlertTriangle, LoaderCircle, MapPinned, Sparkles } from 'lucide-react';

export function LoadingState({ message = 'Loading your travel plans…' }) {
  return (
    <div className="loading-state">
      <LoaderCircle className="spinner" size={24} />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <MapPinned size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="error-banner">
      <AlertTriangle size={18} />
      <span>{message}</span>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow-row">
          <Sparkles size={15} />
          <span>GlobeTrotter</span>
        </div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SectionCard({ title, children, action }) {
  return (
    <section className="section-card">
      <div className="section-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
