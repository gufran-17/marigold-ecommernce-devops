import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  const nums = [];
  for (let i = 1; i <= pages; i += 1) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
  const items = [];
  nums.forEach((n, idx) => {
    if (idx > 0 && n - nums[idx - 1] > 1) items.push(`gap${n}`);
    items.push(n);
  });
  const btn = 'flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors';
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-ink-muted">{total} results</p>
      <ul className="flex items-center gap-1.5">
        <li><button className={`${btn} border-line bg-white hover:border-brand disabled:opacity-40`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button></li>
        {items.map((n) => (typeof n === 'string'
          ? <li key={n} className="px-1 text-ink-muted" aria-hidden="true">…</li>
          : <li key={n}><button className={`${btn} ${n === page ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-brand'}`} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button></li>))}
        <li><button className={`${btn} border-line bg-white hover:border-brand disabled:opacity-40`} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></li>
      </ul>
    </nav>
  );
}
