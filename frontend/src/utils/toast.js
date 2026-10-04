// Tiny toast store (no library). The <Toaster /> component subscribes to it.
let toasts = [];
const listeners = new Set();
let id = 0;

const emit = () => listeners.forEach((l) => l());

export const toastStore = {
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => toasts,
  dismiss(toastId) {
    toasts = toasts.filter((t) => t.id !== toastId);
    emit();
  },
};

function push(type, message) {
  id += 1;
  const toastId = id;
  toasts = [...toasts.slice(-3), { id: toastId, type, message }];
  emit();
  setTimeout(() => toastStore.dismiss(toastId), type === 'error' ? 6000 : 3500);
}

export const toast = {
  success: (m) => push('success', m),
  error: (m) => push('error', m),
  info: (m) => push('info', m),
};
