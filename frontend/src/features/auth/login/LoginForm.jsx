import React from "react";
import FormField from "../../../components/form/FormField";
import PasswordField from "../../../components/form/PasswordField";
import Button from "../../../components/ui/button/Button";
function LoginForm({ formik, isLoading }) {
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-4">
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && formik.errors.email}
          placeholder="Enter your email"
        />

        <PasswordField
          label="Password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && formik.errors.password}
        />
        {formik.errors.server && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
            {formik.errors.server || " "}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full" size="sm">
          {isLoading ? "Loading....." : "Sign"}
        </Button>
      </div>
    </form>
  );
}

export default LoginForm;
