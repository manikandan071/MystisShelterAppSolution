/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import "./CustomInputs.css";
import { useCallback } from "react";
// import { FloatLabel } from "primereact/floatlabel";
import { InputTextarea } from "primereact/inputtextarea";

interface dropDownProps {
  labelText: string;
  value: string;
  onChange: any;
  disabled?: boolean;
  readOnly?: boolean;
  isValid?: boolean;
  sectionType: any;
  placeholder: string;
  inputType?: string;
  customClassName?: string;
}

const CustomTextArea: React.FC<dropDownProps> = ({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  sectionType,
  labelText,
  placeholder,
  inputType = "text",
  customClassName,
  isValid,
}) => {
  const handleChange = useCallback(
    (value: string) => {
      const newValue =
        inputType === "number"
          ? parseFloat(value)
          : value?.trimStart().charAt(0).toUpperCase() +
            value?.trimStart().slice(1);
      onChange?.(newValue);
    },
    [onChange, inputType]
  );
  return (
    <div className={`inputSectionWrapper ${sectionType} inputBox`}>
      {labelText !== "" && (
        <label style={{ width: "100%", fontSize: "13px" }}>{labelText}</label>
      )}
      <InputTextarea
        style={{ fontSize: "13px" }}
        id="labelText"
        value={value}
        disabled={disabled}
        onChange={(e) => handleChange(e?.target?.value)}
        rows={2}
        cols={60}
        className={`w-full md:w-14rem one ${customClassName} ${
          !isValid ? "error-input" : ""
        }`}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
};

export default CustomTextArea;
