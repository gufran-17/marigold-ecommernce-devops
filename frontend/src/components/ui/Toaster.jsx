import { useSyncExternalStore } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { toastStore } from '../../utils/toast';

const styles = {
  success: { icon: CheckCircle2, cls: 'text-brand' },
  error: { icon: AlertCircle, cls: 'text-sale' },
  info: { icon: Info, cls: 'text-blue-600' },
};

export default function Toaster() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end" aria-live="polite">
      {toasts.map((t) => {
        const { icon: Icon, cls } = styles[t.type];
        return (
          <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-pop">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} aria-hidden="true" />
            <p className="flex-1 text-sm font-medium text-ink">{t.message}</p>
            <button onClick={() => toastStore.dismiss(t.id)} aria-label="Dismiss notification" className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}
