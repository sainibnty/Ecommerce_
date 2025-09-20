import { createSlice } from "@reduxjs/toolkit";

const authInitialState = {
  role: null,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setCredentials: (state, action) => {
      const { role, accessToken, userData } = action.payload;
      state.role = role;
      state.token = accessToken;
      state.user = userData;
    },
    logOut: (state) => {
      Object.assign(state, authInitialState);
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrectRole = (state) => state?.auth?.role;
export const selectCurrectToken = (state) => state?.auth?.token;
export const selectCurrectUser = (state) => state?.auth?.user;
export const selectIsAuthenticated = (state) =>
  !!state.auth.token && !!state.auth.user;
