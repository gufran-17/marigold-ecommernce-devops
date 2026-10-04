import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-brand/50',
  accent: 'bg-marigold text-ink hover:bg-marigold-dark disabled:bg-marigold/50',
  outline: 'border border-line bg-white text-ink hover:border-brand hover:text-brand disabled:opacity-50',
  ghost: 'text-ink-soft hover:bg-surface-alt disabled:opacity-50',
  danger: 'bg-sale text-white hover:bg-[#b93636] disabled:bg-sale/50',
};
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
