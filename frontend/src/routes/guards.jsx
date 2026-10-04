import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PageLoader } from '../components/ui';

export function ProtectedRoute() {
  const { user, initializing } = useSelector((s) => s.auth);
  const location = useLocation();
  if (initializing) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, initializing } = useSelector((s) => s.auth);
  if (initializing) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

// Login/register pages: send signed-in users away
export function GuestRoute() {
  const { user, initializing } = useSelector((s) => s.auth);
  if (initializing) return <PageLoader />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
