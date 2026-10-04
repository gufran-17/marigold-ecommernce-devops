import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/authSlice';
import cart from '../features/cartSlice';
import wishlist from '../features/wishlistSlice';

export const createStore = (preloadedState) => configureStore({ reducer: { auth, cart, wishlist }, preloadedState });
export const store = createStore();
