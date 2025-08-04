/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import "./style.css";
import Dashboard from "./Dashboard/Dashboard";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { useState, useEffect } from "react";
import { sp } from "@pnp/sp/presets/all";
import ConfigurationScreen from "./Configurations/ConfigurationScreen";
import Loader from "./Loader/Loader";
import "../assets/css/variables.css";
import "../assets/css/commonstyle.css";
import CustomToast from "./Common/Toast/Toast";

interface Iuser {
  Id: number | undefined;
  Title: string;
  Email: string;
}

const MainComponent: any = (props: any) => {
  const [toastResponse, setToastResponse] = useState<any>({
    severity: "",
    summary: "",
    detail: "",
    life: 3000,
  });

  const [CurrentRole, setCurrentRole] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [users, setUsers] = useState<Iuser[]>([]);
  const CurrentUser = props?.context?._pageContext?._user?.email;
  const [configpage, setconfigpage] = useState<boolean>(false);

  //get Userconfig data
  const getUserConfig = (userList: any) => {
    sp.web.lists
      .getByTitle("UserConfig")
      .items.select("*", "Users/Id", "Users/EMail")
      .expand("Users")
      .filter(`Users/EMail eq '${CurrentUser}'`)
      .top(5000)
      .get()
      .then(async (items) => {
        setCurrentRole(items[0].Role);
        setUsers([...userList]);
        setconfigpage(false);
        setLoader(false);
      })
      .catch((err) => {
        console.error("Error get all userconfig:", err);
      });
  };
  // Get User field values
  const getUser = () => {
    sp.web
      .siteUsers()
      .then((data: any) => {
        const userList = data.map((user: any) => ({
          Id: user.Id,
          Title: user.Title,
          Email: user.Email,
        }));
        getUserConfig([...userList]);
      })
      .catch((err) => {
        console.log("Error : ", err);
      });
  };

  const toastFunc = (
    serverity: string,
    summary: string,
    msg: string,
    life?: number | null
  ): any => {
    setToastResponse({
      severity: serverity,
      summary: summary,
      detail: msg,
      life: life || 3000,
    });
  };
  useEffect(() => {
    setLoader(true);
    getUser();
  }, []);
  return loader ? (
    <Loader />
  ) : !configpage ? (
    <>
      <div>
        <Dashboard
          toastFunc={toastFunc}
          allUser={users}
          CurrentUser={CurrentUser}
          CurrentRole={CurrentRole}
          setconfigpage={setconfigpage}
          context={props?.context}
        />
        <CustomToast
          toastResponse={toastResponse}
          setToastResponse={setToastResponse}
        />
      </div>
    </>
  ) : (
    <div>
      <ConfigurationScreen
        setconfigpage={setconfigpage}
        context={props?.context}
      />
    </div>
  );
};

export default MainComponent;
