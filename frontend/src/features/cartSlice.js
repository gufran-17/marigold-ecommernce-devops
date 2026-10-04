import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi, wishlistApi } from '../api';
import { setWishlist } from './wishlistSlice';

export const fetchCart = createAsyncThunk('cart/fetch', () => cartApi.get());
export const addToCart = createAsyncThunk('cart/add', ({ productId, quantity }) => cartApi.add(productId, quantity));
export const updateCartItem = createAsyncThunk('cart/update', ({ productId, quantity }) => cartApi.update(productId, quantity));
export const removeCartItem = createAsyncThunk('cart/remove', (productId) => cartApi.remove(productId));
export const saveForLater = createAsyncThunk('cart/saveForLater', async (productId, { dispatch }) => {
  const w = await wishlistApi.fromCart(productId);
  dispatch(setWishlist(w.products));
  return cartApi.get();
});

const empty = { items: [], summary: null, notices: [] };

const slice = createSlice({
  name: 'cart',
  initialState: { ...empty, loading: false, loaded: false },
  reducers: {
    resetCart: () => ({ ...empty, loading: false, loaded: false }),
    clearNotices(state) { state.notices = []; },
  },
  extraReducers: (b) => {
    b.addCase(fetchCart.pending, (s) => { s.loading = true; });
    b.addCase(fetchCart.rejected, (s) => { s.loading = false; });
    [fetchCart, addToCart, updateCartItem, removeCartItem, saveForLater].forEach((t) =>
      b.addCase(t.fulfilled, (s, a) => {
        s.items = a.payload.items;
        s.summary = a.payload.summary;
        s.notices = a.payload.notices || [];
        s.loading = false;
        s.loaded = true;
      })
    );
  },
});

export const { resetCart, clearNotices } = slice.actions;
export const selectCartCount = (state) => state.cart.items.reduce((n, i) => n + i.quantity, 0);
export default slice.reducer;
