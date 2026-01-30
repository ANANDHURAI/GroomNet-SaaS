

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLogin: false,
  user: null,
  user_type: '',
  tokens: {
    access: null,
    refresh: null
  }
};

const LoginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {

    login: (state, action) => {

      const { user, access, refresh } = action.payload;

      state.isLogin = true;
      state.user = user;
      state.user_type = user.user_type;
      state.tokens = { access, refresh };

      sessionStorage.setItem('access_token', access);
      sessionStorage.setItem('refresh_token', refresh);
      sessionStorage.setItem('user_type', user.user_type);
      sessionStorage.setItem('user_data', JSON.stringify(user));
    },

    logout: (state) => {
      state.isLogin = false;
      state.user = null;
      state.user_type = '';
      state.tokens = { access: null, refresh: null };

      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user_type');
      sessionStorage.removeItem('user_data');
    }

  }
});

export const { login, logout } = LoginSlice.actions;
export default LoginSlice.reducer;