import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, userApi } from '../api';
import { TOKEN_KEY } from '../api/client';

const saveSession = ({ token }) => localStorage.setItem(TOKEN_KEY, token);

export const login = createAsyncThunk('auth/login', async (body) => {
  const data = await authApi.login(body);
  saveSession(data);
  return data;
});
export const adminLogin = createAsyncThunk('auth/adminLogin', async (body) => {
  const data = await authApi.adminLogin(body);
  saveSession(data);
  return data;
});
export const register = createAsyncThunk('auth/register', async (body) => {
  const data = await authApi.register(body);
  saveSession(data);
  return data;
});
export const fetchMe = createAsyncThunk('auth/fetchMe', async () => (await authApi.me()).user);
export const updateProfile = createAsyncThunk('auth/updateProfile', async (body) => (await userApi.updateProfile(body)).user);

const hasToken = !!localStorage.getItem(TOKEN_KEY);

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, initializing: hasToken },
  reducers: {
    logout(state) {
      localStorage.removeItem(TOKEN_KEY);
      state.user = null;
      state.initializing = false;
    },
    setAddresses(state, action) {
      if (state.user) state.user.addresses = action.payload;
    },
  },
  extraReducers: (b) => {
    [login, adminLogin, register].forEach((t) => b.addCase(t.fulfilled, (s, a) => { s.user = a.payload.user; s.initializing = false; }));
    b.addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.initializing = false; });
    b.addCase(fetchMe.rejected, (s) => { localStorage.removeItem(TOKEN_KEY); s.user = null; s.initializing = false; });
    b.addCase(updateProfile.fulfilled, (s, a) => { s.user = a.payload; });
  },
});

export const { logout, setAddresses } = slice.actions;
export default slice.reducer;
