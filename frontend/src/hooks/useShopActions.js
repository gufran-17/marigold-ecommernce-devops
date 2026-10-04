import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { addToCart } from '../features/cartSlice';
import { toggleWishlist } from '../features/wishlistSlice';
import { toast } from '../utils/toast';
import { errorMessage } from '../utils/format';

// Shared "add to cart" / "wishlist" behaviour: sends guests to login, shows toasts.
export default function useShopActions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s) => s.auth.user);
  const wishlist = useSelector((s) => s.wishlist.products);

  const requireLogin = () => {
    if (user) return false;
    toast.info('Please log in to continue');
    navigate('/login', { state: { from: location.pathname + location.search } });
    return true;
  };

  const add = async (product, quantity = 1) => {
    if (requireLogin()) return false;
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      toast.success(`${product.name} added to cart`);
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const isWished = (id) => wishlist.some((p) => p._id === id);

  const toggleWish = async (product) => {
    if (requireLogin()) return;
    const present = isWished(product._id);
    try {
      await dispatch(toggleWishlist({ productId: product._id, present })).unwrap();
      toast.success(present ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return { add, toggleWish, isWished, requireLogin, user };
}
