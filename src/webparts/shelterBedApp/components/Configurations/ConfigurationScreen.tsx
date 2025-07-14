/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import styles from "./ConfigurationScreen.module.scss";
import ShelterConfig from "./ShelterConfig/ShelterConfig";
import BedConfig from "./BedConfig/BedConfig";
import "../../assets/css/DataTable.css";

const ConfigurationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"bed" | "shelter">("bed");

  return (
    <div className={styles.container}>
      <div className={styles.toggleBar}>
        <button
          className={`${
            activeTab === "shelter" ? styles.activeTabBtn : styles.tabBtn
          }`}
          onClick={() => setActiveTab("shelter")}
          aria-pressed={activeTab === "shelter"}
        >
          Shelter
        </button>
        <button
          className={`${
            activeTab === "bed" ? styles.activeTabBtn : styles.tabBtn
          }`}
          onClick={() => setActiveTab("bed")}
          aria-pressed={activeTab === "bed"}
        >
          Bed
        </button>
      </div>
      <div className={styles.content}>
        {activeTab === "shelter" ? <ShelterConfig /> : <BedConfig />}
      </div>
    </div>
  );
};

export default ConfigurationScreen;
