import { apiSlice } from "../../app/api/apiSlice";

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credential) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: { ...credential },
      }),
    }),
    signUp: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/auth/signup",
        method: "POST",
        body: { ...credentials },
      }),
    }),
  }),
});

export const { useLoginMutation, useSignUpMutation } = authApiSlice;
