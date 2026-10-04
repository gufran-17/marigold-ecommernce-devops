import { AlertTriangle, Loader2, PackageOpen } from 'lucide-react';
import Button from './Button';

export const Spinner = ({ className = '' }) => <Loader2 className={`h-5 w-5 animate-spin text-brand ${className}`} aria-label="Loading" />;

export const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center" role="status"><Spinner className="h-8 w-8" /></div>
);

export const Skeleton = ({ className = '' }) => <div aria-hidden="true" className={`skeleton rounded-lg ${className}`} />;

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden" aria-hidden="true">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="space-y-2 p-4">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-9 w-full" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 6 }) => (
  <div className="space-y-2 p-4" aria-hidden="true">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
);

export function EmptyState({ icon: Icon = PackageOpen, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand"><Icon className="h-7 w-7" aria-hidden="true" /></span>
      <h2 className="text-lg font-bold">{title}</h2>
      {message && <p className="mt-1 max-w-sm text-sm text-ink-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'We could not load this. Check your connection and try again.', onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sale-light text-sale"><AlertTriangle className="h-7 w-7" aria-hidden="true" /></span>
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{message}</p>
      {onRetry && <Button className="mt-5" variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
