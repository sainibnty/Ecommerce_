import React from "react";
import FormField from "../../../components/form/FormField";
import PasswordField from "../../../components/form/PasswordField";
import Button from "../../../components/ui/button/Button";


function RegisterForm({ formik, isLoading }) {
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-600 ease-in-out">
          <FormField
            label="First name"
            name="firstName"
            type="text"
            placeholder="Enter your firstname"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName && formik.errors.firstName}
          />
          <FormField
            label="Last name"
            name="lastName"
            type="text"
            placeholder="Enter your lastname"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && formik.errors.email}
        />

        <FormField
          label="Phone Number"
          name="phone"
          type="number"
          placeholder="Enter your number"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phone && formik.errors.phone}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-600 ease-in-out">
          <PasswordField
            label="Password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
          />
          <PasswordField
            label="Confirm-Password"
            name="confirmPassword"
            placeholder="Enter your confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
          />
        </div>

        {formik.errors.server && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
            {formik.errors.server || " "}
          </div>
        )}
        <Button type="submit" disabled={isLoading} className="w-full" size="sm">
          {isLoading ? "Loading....." : "Register"}
        </Button>
      </div>
    </form>
  );
}

export default RegisterForm;
