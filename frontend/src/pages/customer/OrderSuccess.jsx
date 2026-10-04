import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button, ErrorState, PageLoader } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { orderApi } from '../../api';

export default function OrderSuccess() {
  const { id } = useParams();
  const { data: order, loading, error } = useAsync(() => orderApi.get(id).then((d) => d.order), [id]);
  if (loading) return <PageLoader />;
  if (error || !order) return <ErrorState />;
  return (
    <div className="container-page flex flex-col items-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand"><CheckCircle2 className="h-9 w-9" /></span>
      <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">Order placed successfully</h1>
      <p className="mt-2 text-ink-muted">Order number <span className="font-bold text-ink">{order.orderNumber}</span></p>
      <p className="mt-1 text-sm text-ink-muted">We will notify you as your order moves through processing and delivery.</p>
      <div className="mt-6 flex gap-3">
        <Link to={`/orders/${order._id}`}><Button>View order details</Button></Link>
        <Link to="/products"><Button variant="outline">Continue shopping</Button></Link>
      </div>
    </div>
  );
}
