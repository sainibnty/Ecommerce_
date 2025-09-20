import React from "react";
import LoginForm from "./LoginForm";
import { Link } from "react-router";

function LoginLayout({ formik, isLoading }) {
  return (
    // <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500  opacity-5">
    //   <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
    //     <div className="shadow-lg px-5 py-5 bg-gray-50 md:rounded-md">
    //       <div className="mb-5 sm:mb-5">
    //         <h1 className="mb-1 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
    //           Sign In
    //         </h1>
    //         <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
    //           Enter your email and password to sign in!
    //         </p>
    //       </div>
    //       <LoginForm formik={formik} isLoading={isLoading} />
    //       <div className="mt-5">
    //         <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
    //           Don&apos;t have an account?{" "}
    //           <Link
    //             to="/signup"
    //             className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
    //           >
    //             Sign Up
    //           </Link>
    //         </p>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="relative flex flex-col h-screen">
      {/* Gradient Background */}
      <div className="absolute inset-0  bg-linear-115 from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] sm:bg-linear-145  opacity-40"></div>

      {/* Content */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto relative z-10">
        <div className="shadow-lg px-5 py-5 bg-gray-50/95 md:rounded-md backdrop-blur-sm">
          <div className="mb-5 sm:mb-5">
            <h1 className="mb-1 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
              Sign In
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Enter your email and password to sign in!
            </p>
          </div>
          <LoginForm formik={formik} isLoading={isLoading} />
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginLayout;
