import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistApi } from '../api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => (await wishlistApi.get()).products);
export const toggleWishlist = createAsyncThunk('wishlist/toggle', async ({ productId, present }) =>
  (present ? await wishlistApi.remove(productId) : await wishlistApi.add(productId)).products
);

const slice = createSlice({
  name: 'wishlist',
  initialState: { products: [], loaded: false },
  reducers: {
    resetWishlist: () => ({ products: [], loaded: false }),
    setWishlist(state, action) { state.products = action.payload; state.loaded = true; },
  },
  extraReducers: (b) => {
    [fetchWishlist, toggleWishlist].forEach((t) => b.addCase(t.fulfilled, (s, a) => { s.products = a.payload; s.loaded = true; }));
  },
});

export const { resetWishlist, setWishlist } = slice.actions;
export default slice.reducer;
