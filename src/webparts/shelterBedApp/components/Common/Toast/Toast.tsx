/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */

import * as React from "react";
import { Toast } from "primereact/toast";
import { useEffect, useRef } from "react";
import "./Toast.css";

interface ToastProps {
  toastResponse: any;
  setToastResponse: any;
}

const CustomToast: React.FC<ToastProps> = ({
  toastResponse,
  setToastResponse,
}) => {
  const toast: any = useRef(null);
  const icons: Record<string, string> = {
    success: "pi pi-check-circle",
    warn: "pi pi-exclamation-triangle",
    error: "pi pi-times-circle",
  };
  useEffect(() => {
    if (toastResponse && toastResponse.severity !== "") {
      toast.current.show({
        severity: toastResponse.severity,
        summary: toastResponse.summary,
        detail: toastResponse.detail,
        life: toastResponse.life || 3000,
        content: (
          <div className={`custom-toast-content ${toastResponse.severity}`}>
            <i className={`${icons[toastResponse.severity]} custom-icon`} />
            <div className="toast-text">
              <div className="toast-title">
                {toastResponse.summary.toUpperCase()}
              </div>
              <span>{toastResponse?.detail}</span>
            </div>
          </div>
        ),
      });
      setToastResponse({
        severity: "",
        summary: "",
        detail: "",
        life: 3000,
      });
    }
  }, [toastResponse]);
  return (
    <>
      <Toast ref={toast} />
    </>
  );
};

export default CustomToast;
