import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
function Label({ htmlFor, children, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        twMerge(
          "mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-400",
          className
        )
      )}
    >
      {children}
    </label>
  );
}

export default Label;
