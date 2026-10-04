import { Search } from 'lucide-react';

export default function AdminToolbar({ search, onSearch, placeholder = 'Search…', children }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {onSearch && (
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="input pl-9" />
        </div>
      )}
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
