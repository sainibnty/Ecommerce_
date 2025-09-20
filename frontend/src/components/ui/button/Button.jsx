import React from "react";
import clsx from "clsx";
function Button({
  children,
  size = "md",
  variant = "primary",
  StartIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  iconProps,
  type = "button",
}) {
  const sizeClasses = {
    md: "px-5 py-3.5 text-sm",
    sm: "px-3 py-2 text-sm",
    lg: "px-6 py-4 text-base",
  };

  const variantClasses = {
    primary:
      "text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:opacity-90 focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-md",
    danger:
      "text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:opacity-90 focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-md",
    success:
      "text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:opacity-90 focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-md",
    pink: "text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:opacity-90 focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-md",
    outline:
      "px-4 py-2 text-sm border border-gray-500 text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-400 dark:hover:bg-gray-800/40 rounded-md",
    shinyoutline:
      "relative inline-flex items-center justify-center overflow-hidden px-6 py-2 bg-success-300 text-sm font-medium rounded-md border border-transparent text-gray-900 dark:text-gray-100 " +
      "before:absolute before:inset-0 before:rounded-md before:border-2 before:border-transparent " +
      "before:bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.5),transparent)] " +
      "before:-translate-x-full before:animate-[shiny-slide_2s_linear_infinite] " +
      "hover:bg-success-500 dark:hover:bg-success-800/40",
  };

  const renderIcon = (Icon) =>
    typeof Icon === "function" ? <Icon {...iconProps} /> : Icon;
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2",
        sizeClasses[size],
        variantClasses[variant],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {StartIcon && (
        <span className="flex items-center justify-center h-full">
          <StartIcon {...iconProps} />
        </span>
      )}
      {children}
      {endIcon && (
        <span className="flex items-center text-sm">{renderIcon(endIcon)}</span>
      )}
    </button>
  );
}

export default Button;
