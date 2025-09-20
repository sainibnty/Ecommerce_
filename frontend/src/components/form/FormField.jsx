import React from "react";
import Label from "./input/Label";
import InputField from "./input/InputField";

const FormField = React.forwardRef(
  (
    {
      label,
      placeholder = "",
      error,
      required = false,
      autoComplete = "off",
      ...props
    },
    ref
  ) => {
    return (
      <>
        <div>
          <Label>
            {label} {required && <span className="text-error-500">*</span>}
          </Label>
          <InputField
            placeholder={placeholder}
            autoComplete={autoComplete}
            {...props}
            ref={ref}
          />
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mt-2">
              {error}
            </div>
          )}
        </div>
      </>
    );
  }
);

export default FormField;
