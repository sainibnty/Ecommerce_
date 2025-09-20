import React from "react";
import PageMeta from "../../../components/common/PageMeta";
import RegisterForm from "./RegisterForm";
import { useFormik } from "formik";
import { initialValue } from "./initialValue";
import { RegisterSchema } from "./registerationSchema";
import { useSignUpMutation } from "../authApiSlice";
import toast from "react-hot-toast";
import RegistrationLayout from "./RegistrationLayout";

function Register() {
  const [signuFu, { isLoading }] = useSignUpMutation();
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: RegisterSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { setErrors, resetForm }) => {
      try {
        await signuFu(values).unwrap();
        toast.success("Regestration successfully");
        resetForm();
      } catch (err) {
        let msg;

        if (err?.data?.message?.startsWith("Can't find")) {
          msg = "No server response";
        } else {
          msg = err?.data?.message || err?.error || "Registration failed";
        }

        setErrors({ server: msg });
      }
    },
  });
  return (
    <>
      <PageMeta
        title="Register - MyApp"
        description="Create your account to access personalized features, manage your profile, and start using MyApp securely."
      />
      <RegistrationLayout formik={formik} isLoading={isLoading} />
    </>
  );
}

export default Register;
