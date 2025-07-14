import * as React from "react";
import { Button } from "primereact/button";
import "./Buttons.css";

interface ButtonProps {
  text: string;
  icon?: string;
  onClick: any;
  btnType: "primaryBtn" | "secondaryBtn" | "submitBtn" | "cancelBtn";
  onlyIcon?: boolean;
  disabled?: boolean;
}

const CustomButton: React.FC<ButtonProps> = ({
  btnType,
  disabled = false,
  icon,
  onClick,
  text,
  onlyIcon,
}) => {
  return (
    <Button
      label={text}
      icon={icon}
      onClick={() => onClick()}
      disabled={disabled}
      className={`${btnType} defaultBtn`}
    />
  );
};
export default CustomButton;
