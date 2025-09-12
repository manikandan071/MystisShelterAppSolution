/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
const logo = require("../../assets/images/mystis_logo_image.jpg");
import styles from "./NoRoleScreen.module.scss";

const NoRoleScreen = () => {
  return (
    <div className={styles.maincontainer}>
      <div>
        <div className={styles.bannerSection}>
          <div className={styles.logoSection}>
            <img src={logo} alt="logo" />
            <h2 className={styles.heading}>Mysti's Shelter Management</h2>
          </div>
        </div>
      </div>
      <div className={styles.sectionWrapper}>
        <div style={{ textAlign: "center" }}>
          <h2>No Role Assigned!</h2>
          <span>Please contact your administrator to assign a role.</span>
        </div>
      </div>
    </div>
  );
};
export default NoRoleScreen;
