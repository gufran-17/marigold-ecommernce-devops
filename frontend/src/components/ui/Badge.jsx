import { STATUS_STYLES } from '../../utils/format';

export default function Badge({ children, className = '' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>;
}

export const StatusBadge = ({ status }) => <Badge className={STATUS_STYLES[status] || 'bg-surface-alt text-ink-soft'}>{status}</Badge>;
