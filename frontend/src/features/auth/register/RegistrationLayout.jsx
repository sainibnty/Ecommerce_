import React from "react";
import RegisterForm from "./RegisterForm";
import { Link } from "react-router";

function RegistrationLayout({ formik, isLoading }) {
  return (
    <div className="relative flex flex-col h-screen">
      {/* Gradient Background */}
      <div className="absolute inset-0  bg-linear-115 from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] sm:bg-linear-145  opacity-40"></div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto relative z-10">
        <div className="shadow-lg px-5 py-5 bg-gray-50 md:rounded-md">
          <div className="mb-5 sm:mb-5">
            <h1 className=" font-semibold text-gray-800 text-lg uppercase text-title-sm dark:text-white/90 sm:text-title-md text-center">
              Create Account
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Fill the form below to create a new account!
            </p>
          </div>
          <RegisterForm formik={formik} isLoading={isLoading} />
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account? {""}
              <Link
                to="/login"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationLayout;
