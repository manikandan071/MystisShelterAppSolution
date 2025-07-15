/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import "./CustomInputs.css";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useCallback } from "react";

interface dropDownProps {
  value: string;
  onChange: any;
  placeholder: string;
  width?: string;
  disabled?: boolean;
  customClassName?: string;
}

const CustomSearchInput: React.FC<dropDownProps> = ({
  value,
  onChange,
  placeholder,
  width = "204.87px",
  disabled = false,
  customClassName,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue);
    },
    [onChange]
  );

  return (
    <div className={`inputBox`}>
      {/* <InputText
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        className={`w-full md:w-14rem one ${customClassName} ${
          !isValid ? "error-input" : ""
        }`}
      /> */}

      <IconField iconPosition="left" disabled={disabled}>
        <InputIcon
          className="pi pi-search"
          style={{ padding: "0px 5px", fontSize: "16px" }}
        />
        <InputText
          style={{
            padding: "0.5rem 0.75rem",
            fontSize: "0.8rem",
            height: "32px",
            borderRadius: "4px",
            paddingLeft: "2.5rem",
            borderColor: "#b99223",
            width: `${width}`,
          }}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
        />
      </IconField>
    </div>
  );
};

export default CustomSearchInput;
