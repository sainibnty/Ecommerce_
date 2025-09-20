import PageMeta from "../../../components/common/PageMeta";
import { useLoginMutation } from "../authApiSlice";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useCredentials } from "../hooks/useCredentials";
import { LoginSchema } from "./loginValidation";
import { initialValues } from "./initialValue";
import LoginLayout from "./LoginLayout";
import { useLocation, useNavigate } from "react-router";

function Login() {
  const [loginfn, { isLoading }] = useLoginMutation();
  const { setCredentials } = useCredentials();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    location.state?.from && typeof location.state.from === "object"
      ? location.state.from.pathname + (location.state.from.search || "")
      : location.state?.from || "/dashboard";
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: LoginSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { setErrors, resetForm }) => {
      try {
        const res = await loginfn(values).unwrap();
        const { accessToken, role, user } = res;
        setCredentials({ accessToken, role, userData: user });
        toast.success("Login successful!");
        resetForm();
        navigate(from);
      } catch (err) {
        const msg = err?.data?.message || err?.error || "Login failed";
        setErrors({ server: msg });
      }
    },
  });

  return (
    <>
      <PageMeta
        title="Login - MyApp"
        description="Access your account securely. Log in to manage your profile, view your dashboard, and explore personalized features."
      />
      <LoginLayout formik={formik} isLoading={isLoading} />
    </>
  );
}

export default Login;
