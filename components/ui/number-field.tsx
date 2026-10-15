import React from "react";
import { Input, type InputProps } from "./input";

export interface NumberFieldProps extends Omit<InputProps, "type"> {
  unit?: string;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ unit, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        inputMode="decimal"
        suffix={unit}
        {...props}
      />
    );
  },
);

NumberField.displayName = "NumberField";
