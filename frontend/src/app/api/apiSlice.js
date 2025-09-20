import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "../../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl:
    import.meta.env.MODE === "development"
      ? "http://localhost:3000"
      : "https://ecommerce-1-eumb.onrender.com",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 403) {
    // Try refresh token
    const refreshResult = await baseQuery(
      "/api/v1/auth/refresh",
      api,
      extraOptions
    );
    if (refreshResult?.data) {
      const { accessToken, role, user } = refreshResult.data;
      // Save new token into Redux
      api.dispatch(
        setCredentials({
          accessToken,
          role,
          userData: user,
        })
      );
      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
      api.dispatch(apiSlice.util.resetApiState());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});
