import * as React from "react";
import "./style.css";
import Dashboard from "./Dashboard/Dashboard";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { Toast } from "primereact/toast";
import { useState, useRef, useEffect } from "react";
import { sp } from "@pnp/sp/presets/all";
import ConfigurationScreen from "./Configurations/ConfigurationScreen";
import Loader from "./Loader/Loader";

interface Iuser {
  Id: number | null;
  Title: string;
  Email: string;
}

const MainComponent: any = (props: any) => {
  const [CurrentRole, setCurrentRole] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [users, setUsers] = useState<Iuser[]>([]);
  const toast: any = useRef(null);
  const CurrentUser = props?.context?._pageContext?._user?.email;
  const [configpage, setconfigpage] = useState<boolean>(false);

  // err function
  const errFunction = (err: string, funcName: string): void => {
    console.log(err, funcName);
  };

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
        errFunction("Error getUser:", err);
      });
  };

  const toastFunc = (
    serverity: string,
    summary: string,
    msg: string,
    life?: number | null
  ): any => {
    toast.current.show({
      severity: serverity,
      summary: summary,
      detail: msg,
      life: life || 3000,
    });
  };
  useEffect(() => {
    setLoader(true);
    getUser(); // Call the async function inside useEffect
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
        />
        <Toast ref={toast} />
      </div>
    </>
  ) : (
    <div>
      <ConfigurationScreen setconfigpage={setconfigpage} />
    </div>
  );
};

export default MainComponent;
