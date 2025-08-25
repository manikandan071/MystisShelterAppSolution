/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import styles from "./ConfigurationScreen.module.scss";
import ShelterConfig from "./ShelterConfig/ShelterConfig";
import BedConfig from "./BedConfig/BedConfig";
import Tooltip from "@mui/material/Tooltip";
import "../../assets/css/DataTable.css";
import UserConfig from "./UserConfig/UserConfig";
import { useEffect } from "react";
interface IProps {
  setconfigpage: any;
  context: any;
  CurrentRole: string;
  checkRoleBasedOnAction: any;
}

const ConfigurationScreen = (props: IProps) => {
  const [activeTab, setActiveTab] = React.useState<"bed" | "shelter" | "users">(
    "users"
  );

  useEffect(() => {
    props.checkRoleBasedOnAction();
  }, [props.CurrentRole]);

  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "30px 20px 16px 20px",
        }}
      >
        <div className={styles.toggleBar}>
          <button
            className={`${
              activeTab === "shelter" ? styles.activeTabBtn : styles.tabBtn
            }`}
            onClick={() => setActiveTab("shelter")}
            aria-pressed={activeTab === "shelter"}
            style={{ borderRadius: "3px 0 0 3px" }}
          >
            Shelter
          </button>
          <button
            className={`${
              activeTab === "bed" ? styles.activeTabBtn : styles.tabBtn
            }`}
            onClick={() => setActiveTab("bed")}
            aria-pressed={activeTab === "bed"}
            style={{
              borderRadius: "0",
              borderRight: "none",
              borderLeft: "none",
            }}
          >
            Bed
          </button>
          <button
            className={`${
              activeTab === "users" ? styles.activeTabBtn : styles.tabBtn
            }`}
            onClick={() => setActiveTab("users")}
            aria-pressed={activeTab === "users"}
            style={{ borderRadius: "0 3px 3px 0" }}
          >
            Users
          </button>
        </div>
        <Tooltip title="Home">
          <i
            className="pi pi-home"
            style={{
              color: "#fff",
              backgroundColor: "#2d2a3f",
              cursor: "pointer",
              fontSize: "14px",
              padding: "9px",
              borderRadius: 5,
            }}
            onClick={() => {
              props.setconfigpage(false);
            }}
          />
        </Tooltip>
      </div>
      <div className={styles.content}>
        {activeTab === "shelter" ? (
          <ShelterConfig />
        ) : activeTab === "bed" ? (
          <BedConfig />
        ) : (
          <UserConfig context={props?.context} />
        )}
      </div>
    </div>
  );
};

export default ConfigurationScreen;
