import { Star } from 'lucide-react';

export function Stars({ value = 0, size = 'h-4 w-4' }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden="true" className={`${size} ${value >= n - 0.25 ? 'fill-marigold text-marigold' : value >= n - 0.75 ? 'fill-marigold/50 text-marigold' : 'text-line'}`} />
      ))}
    </span>
  );
}

export default function Rating({ value = 0, count = 0 }) {
  if (!count) return <span className="text-xs text-ink-muted">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <Stars value={value} />
      <span className="font-semibold text-ink-soft">{value.toFixed(1)}</span>
      <span className="text-ink-muted">({count})</span>
    </span>
  );
}

export function RatingInput({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Your rating" className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="rounded p-0.5">
          <Star className={`h-6 w-6 ${value >= n ? 'fill-marigold text-marigold' : 'text-line'}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
