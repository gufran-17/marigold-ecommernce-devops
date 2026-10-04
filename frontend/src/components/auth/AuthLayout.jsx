import { Link } from 'react-router-dom';
import { Logo } from '../layout/Navbar';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center"><Logo /></div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-5 text-center text-sm text-ink-muted">{footer}</p>}
        <p className="mt-2 text-center text-xs"><Link to="/" className="link">Continue browsing as guest</Link></p>
      </div>
    </div>
  );
}
