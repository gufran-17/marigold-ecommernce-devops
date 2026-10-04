import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Rating } from '../../components/ui';
import { ConfirmDialog, ErrorState, Pagination, TableSkeleton } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { adminApi } from '../../api';
import { errorMessage, formatDate } from '../../utils/format';
import { toast } from '../../utils/toast';

export default function AdminReviews() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => adminApi.reviews({ page, limit: 10 }), [page]);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try { await adminApi.deleteReview(toDelete._id); toast.success('Review deleted'); reload(); }
    catch (e) { toast.error(errorMessage(e)); }
    finally { setBusy(false); setToDelete(null); }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Reviews</h1>
      <div className="card">
        {loading ? <TableSkeleton /> : error ? <ErrorState onRetry={reload} /> : (
          <ul className="divide-y divide-line">
            {data.reviews.map((r) => (
              <li key={r._id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><Rating value={r.rating} count={1} /><span className="text-xs text-ink-muted">{formatDate(r.createdAt)}</span></div>
                  {r.title && <p className="mt-1 text-sm font-bold">{r.title}</p>}
                  <p className="mt-0.5 text-sm text-ink-soft">{r.comment}</p>
                  <p className="mt-1 text-xs text-ink-muted">{r.user ? r.user.name : 'Unknown'} on {r.product ? r.product.name : 'a product'}</p>
                </div>
                <button onClick={() => setToDelete(r)} aria-label="Delete review" className="shrink-0 rounded-lg p-2 text-sale hover:bg-sale-light"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
            {data.reviews.length === 0 && <li className="p-8 text-center text-ink-muted">No reviews yet.</li>}
          </ul>
        )}
        {data && <div className="px-4 pb-4"><Pagination pagination={data.pagination} onChange={setPage} /></div>}
      </div>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete review?" message="This review will be permanently removed." confirmLabel="Delete" danger loading={busy} onConfirm={remove} />
    </div>
  );
}
