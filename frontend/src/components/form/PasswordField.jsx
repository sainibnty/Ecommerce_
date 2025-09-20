// import { useState } from "react";
// import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
// import InputField from "./input/InputField";
// import Label from "./input/Label";

// const PasswordField = ({
//   label,
//   name,
//   value,
//   onChange,
//   onBlur,
//   error,
//   required = false,
// }) => {
//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <>
//       <Label>
//         {label}
//         {required && <span className="text-error-500">*</span>}
//       </Label>
//       <div className="relative">
//         <InputField
//           type={showPassword ? "text" : "password"}
//           placeholder="Enter your password"
//           name={name}
//           value={value}
//           onChange={onChange}
//           onBlur={onBlur}
//           autoComplete="true"
//         />
//         <span
//           onClick={() => setShowPassword(!showPassword)}
//           className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
//         >
//           {showPassword ? (
//             <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//           ) : (
//             <EyeSlashIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//           )}
//         </span>
//       </div>
//       {error && (
//         <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
//           {error}
//         </div>
//       )}
//     </>
//   );
// };

// export default PasswordField;

import React from "react";
import Label from "./input/Label";
import InputField from "./input/InputField";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// const PasswordField = React.forwardRef(
//   ({ label, placeholder, error, ...props }, ref) => {
//     const [showPassword, setShowPassword] = useState(false);
//     return (
//       <>
//         <div>
//           <Label>{label}</Label>
//           <div className="relative">
//             <InputField
//               type={showPassword ? "text" : "password"}
//               placeholder={placeholder || "Enter your password"}
//               {...props}
//               ref={ref}
//             />
//             <span
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
//             >
//               {showPassword ? (
//                 <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//               ) : (
//                 <EyeSlashIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//               )}
//             </span>
//           </div>

//           {error && (
//             <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mt-2 mb-2">
//               {error}
//             </div>
//           )}
//         </div>
//       </>
//     );
//   }
// );

const PasswordField = React.forwardRef(
  ({ label, placeholder, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div>
        <Label>{label}</Label>
        <div className="relative">
          <InputField
            type={showPassword ? "text" : "password"}
            placeholder={placeholder || "Enter your password"}
            {...props}
            ref={ref}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-10"
          >
            {showPassword ? (
              <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <EyeSlashIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md mt-1">
            {error}
          </div>
        )}
      </div>
    );
  }
);

export default PasswordField;
