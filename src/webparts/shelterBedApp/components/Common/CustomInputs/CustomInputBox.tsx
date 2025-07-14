/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import "./CustomInputs.css";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useRef } from "react";

interface dropDownProps {
  labelText: string;
  value: string;
  onChange: any;
  disabled?: boolean;
  isValid?: boolean;
  sectionType: any;
  placeholder: string;
  inputType?: string;
  customClassName?: string;
  onFoucs?: boolean;
}

const CustomInputBox: React.FC<dropDownProps> = ({
  value,
  onChange,
  disabled = false,
  sectionType,
  labelText,
  placeholder,
  inputType = "text",
  customClassName,
  isValid,
  onFoucs = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  console.log("isValid", isValid);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue =
        inputType === "number"
          ? parseFloat(e.target.value)
          : e.target?.value?.trimStart().charAt(0).toUpperCase() +
            e.target?.value?.trimStart().slice(1);
      onChange?.(newValue);
    },
    [onChange, inputType]
  );
  useEffect(() => {
    // 🔹 step 2: trigger focus on mount if onFoucs === true
    if (onFoucs && inputRef.current) {
      inputRef.current.focus();
    }
  }, [onFoucs]);
  return (
    <div className={`inputSectionWrapper ${sectionType} inputBox`}>
      {labelText !== "" && (
        <label style={{ width: "100%", fontSize: "13px" }}>{labelText}</label>
      )}
      <InputText
        ref={inputRef}
        type={inputType}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        className={`w-full md:w-14rem one ${customClassName} ${
          !isValid ? "error-input" : ""
        }`}
      />
    </div>
  );
};

export default CustomInputBox;
