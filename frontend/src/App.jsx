import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import { AdminRoute, GuestRoute, ProtectedRoute } from './routes/guards';
import { PageLoader, Toaster } from './components/ui';
import { fetchMe, logout } from './features/authSlice';
import { fetchCart, resetCart } from './features/cartSlice';
import { fetchWishlist, resetWishlist } from './features/wishlistSlice';
import { TOKEN_KEY } from './api/client';
import { toast } from './utils/toast';

const page = (loader) => lazy(loader);
const Home = page(() => import('./pages/public/Home'));
const Products = page(() => import('./pages/public/Products'));
const ProductDetails = page(() => import('./pages/public/ProductDetails'));
const Categories = page(() => import('./pages/public/Categories'));
const Login = page(() => import('./pages/public/Login'));
const Register = page(() => import('./pages/public/Register'));
const ForgotPassword = page(() => import('./pages/public/ForgotPassword'));
const ResetPassword = page(() => import('./pages/public/ResetPassword'));
const About = page(() => import('./pages/public/About'));
const Contact = page(() => import('./pages/public/Contact'));
const NotFound = page(() => import('./pages/public/NotFound'));
const Cart = page(() => import('./pages/customer/Cart'));
const Wishlist = page(() => import('./pages/customer/Wishlist'));
const Checkout = page(() => import('./pages/customer/Checkout'));
const OrderSuccess = page(() => import('./pages/customer/OrderSuccess'));
const MyOrders = page(() => import('./pages/customer/MyOrders'));
const OrderDetails = page(() => import('./pages/customer/OrderDetails'));
const Profile = page(() => import('./pages/customer/Profile'));
const ChangePassword = page(() => import('./pages/customer/ChangePassword'));
const AdminLogin = page(() => import('./pages/admin/AdminLogin'));
const Dashboard = page(() => import('./pages/admin/Dashboard'));
const AdminProducts = page(() => import('./pages/admin/AdminProducts'));
const ProductForm = page(() => import('./pages/admin/ProductForm'));
const AdminCategories = page(() => import('./pages/admin/AdminCategories'));
const AdminOrders = page(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = page(() => import('./pages/admin/AdminCustomers'));
const AdminReviews = page(() => import('./pages/admin/AdminReviews'));
const AdminInventory = page(() => import('./pages/admin/AdminInventory'));

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  // Restore the session on first load
  useEffect(() => { if (localStorage.getItem(TOKEN_KEY)) dispatch(fetchMe()); }, [dispatch]);

  // Load the cart + wishlist for signed-in customers
  useEffect(() => {
    if (user) { dispatch(fetchCart()); dispatch(fetchWishlist()); }
    else { dispatch(resetCart()); dispatch(resetWishlist()); }
  }, [user, dispatch]);

  // Token expired / revoked
  useEffect(() => {
    const onExpired = () => { dispatch(logout()); toast.info('Your session expired. Please log in again.'); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch]);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="search" element={<Products search />} />
            <Route path="products/:slug" element={<ProductDetails />} />
            <Route path="categories" element={<Categories />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route element={<GuestRoute />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="cart" element={<Cart />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success/:id" element={<OrderSuccess />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/password" element={<ChangePassword />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/login" element={<AdminLogin />} />
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}
