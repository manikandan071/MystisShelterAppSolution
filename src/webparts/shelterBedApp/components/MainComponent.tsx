import * as React from "react";
import "./style.css";
import Dashboard from "./Dashboard/Dashboard";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { Toast } from "primereact/toast";
import { useState, useRef, useEffect } from "react";
import { sp } from "@pnp/sp/presets/all";

interface Iuser {
  Id: number | null;
  Title: string;
  Email: string;
}

const MainComponent: any = (props: any) => {
  const [CurrentRole, setCurrentRole] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(true);
  const [users, setUsers] = useState<Iuser[]>([]);
  const toast: any = useRef(null);
  const CurrentUser = props?.context?._pageContext?._user?.email;

  // err function
  const errFunction = (err: string, funcName: string): void => {
    console.log(err, funcName);
  };

  //get Userconfig data
  const getUserConfig = () => {
    sp.web.lists
      .getByTitle("UserConfig")
      .items.select("*", "Users/Id", "Users/EMail")
      .expand("Users")
      .filter(`Users/EMail eq '${CurrentUser}'`)
      .top(5000)
      .get()
      .then(async (items) => {
        setCurrentRole(items[0].Role);
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
        setUsers([...userList]);
        getUserConfig();
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
    getUser(); // Call the async function inside useEffect
  }, []);
  return (
    !loader && (
      <div>
        <Dashboard
          toastFunc={toastFunc}
          allUser={users}
          CurrentUser={CurrentUser}
          CurrentRole={CurrentRole}
        />
        <Toast ref={toast} />
      </div>
    )
  );
};

export default MainComponent;
