import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Button, EmptyState, ErrorState, Pagination, StatusBadge, TableSkeleton } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { orderApi } from '../../api';
import { firstImage } from '../../utils/image';
import { formatDate, formatPrice } from '../../utils/format';

export default function MyOrders() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => orderApi.mine({ page, limit: 8 }), [page]);

  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">My orders</h1>
      <div className="mt-6">
        {loading ? <div className="card"><TableSkeleton /></div> : error ? <ErrorState onRetry={reload} /> : data.orders.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" message="Your placed orders will show up here." action={<Link to="/products"><Button>Start shopping</Button></Link>} />
        ) : (
          <>
            <ul className="space-y-4">
              {data.orders.map((o) => (
                <li key={o._id} className="card p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                    <div><p className="text-xs text-ink-muted">Order #{o.orderNumber}</p><p className="text-xs text-ink-muted">Placed {formatDate(o.createdAt)}</p></div>
                    <StatusBadge status={o.orderStatus} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {o.items.slice(0, 4).map((it) => <img key={it.product} src={firstImage({ images: [{ url: it.image }] })} alt="" className="h-12 w-12 rounded-lg object-cover" />)}
                    {o.items.length > 4 && <span className="text-xs font-semibold text-ink-muted">+{o.items.length - 4} more</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-extrabold">{formatPrice(o.totalAmount)}</p>
                    <Link to={`/orders/${o._id}`}><Button size="sm" variant="outline">View details</Button></Link>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination pagination={data.pagination} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
