/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import { Dropdown } from "primereact/dropdown";
import "./CustomInputs.css";
import { useEffect } from "react";

interface dropDownProps {
  options: any[];
  labelText: string;
  value: string;
  onClick: any;
  disabled: boolean;
  isValid: boolean;
  ismandatory: boolean;
  sectionType: any;
}

const CustomDropDown: React.FC<dropDownProps> = ({
  options,
  value,
  onClick,
  disabled = false,
  sectionType,
  labelText,
  isValid,
  ismandatory = false,
}) => {
  useEffect(() => {
    console.log("value", value);

    // Wait a tick to ensure dropdown is rendered
    const timeout = setTimeout(() => {
      const focusedDropdown = document.querySelector(".p-dropdown.p-focus");
      if (focusedDropdown) {
        focusedDropdown.classList.remove("p-focus");
      }
    }, 100); // delay helps in case popup renders async

    return () => clearTimeout(timeout);
  }, [labelText]);
  return (
    <div className={`inputSectionWrapper ${sectionType} custom-dropdown`}>
      <label style={{ width: "100%", fontSize: "13px", fontWeight: "500" }}>
        {labelText}{" "}
        <strong style={{ color: "red" }}>{ismandatory ? "*" : ""}</strong>
      </label>
      <Dropdown
        value={value}
        onChange={(e) => onClick(e.value)}
        options={options}
        optionLabel="name"
        placeholder="Select"
        className={`w-full md:w-14rem one ${!isValid ? "error-input" : ""}`}
        checkmark={true}
        highlightOnSelect={false}
        disabled={disabled}
      />
    </div>
  );
};
export default CustomDropDown;
