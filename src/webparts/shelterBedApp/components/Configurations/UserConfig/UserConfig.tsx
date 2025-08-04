/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import styles from "./UserConfig.module.scss";
import { useEffect, useState } from "react";
import {
  fetchUserGroupsAndUsers,
  removeUserFunction,
  userUpdateSubmission,
} from "../../../../../Services/ConfigurationServices";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OnTextRender } from "../../../../../Utils/dataTable";
import CustomButton from "../../Common/Buttons/Buttons";
import Popup from "../../Common/Popup/Popup";
import { togglePopupVisibility } from "../../../../../Utils/togglePopup";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { sp } from "@pnp/sp";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";
import CustomSearchInput from "../../Common/CustomInputs/CustomSearchInput";
import CustomToast from "../../Common/Toast/Toast";

interface IProps {
  context: any;
}

const UserConfig = (props: IProps) => {
  const popupMultiPeoplePickerStyle = {
    root: {
      background: "rgba(218, 218, 218, 0.29)",
      ".ms-BasePicker-text": {
        borderRadius: "4px",
        overflowX: "hidden",
        padding: "5px",
        minHeight: "100px",
        maxHeight: "150px",
        background: "#fff",
        border: "1px solid #6f6a8a75",
        outline: "none",
        alignItems: "start",
      },
      ".ms-BasePicker-input": {
        height: "30px",
        alignSelf: "start",
      },
      ".ms-BasePicker-input::placeholder": {
        // fontFamily: "interMedium",
      },
      ".ms-BasePicker-text:after": {
        display: "none",
      },
      ".ms-BasePicker-text:hover": {
        border: "1px solid #b99223",
      },
      ".ms-TooltipHost": {
        // fontFamily: "interMedium",
        fontSize: "13px",
        color: "#414141",
      },
      ".ms-PickerPersona-container": {
        background: "#e8e8e8",
        maxWidth: "auto",
        minWidth: "auto",
      },
      ".ms-PickerItem-removeButton": {
        display: "block",
      },
      ".ms-PickerItem-removeButton:focus": {
        background: "#555",
      },
      ".ms-BasePicker-itemsWrapper": {
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "2px",
        overflow: "auto",
      },
    },
  };

  const initialPopupController = [
    {
      open: false,
      popupTitle: "",
      popupWidth: "40%",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
    },
    {
      open: false,
      popupTitle: "",
      popupWidth: "30%",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
    },
  ];
  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const handleClosePopup = (index?: any): void => {
    togglePopupVisibility(setPopupController, index, "close");
  };
  const [toastResponse, setToastResponse] = useState<any>({
    severity: "",
    summary: "",
    detail: "",
    life: 3000,
  });
  const [activeGroupTab, setActiveGroupTab] = React.useState<
    "supervisor" | "billing" | "approver" | ""
  >("");
  const [formDetails, setFormDetails] = useState<any>({
    Id: 0,
    Users: [],
  });
  const [searchValue, setSearchValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [masterList, setMasterList] = useState<any>();
  const [supervisorList, setSupervisorList] = useState<any>([]);
  const [billingteamList, setBillingteamList] = useState<any>([]);
  const [approverList, setApproverList] = useState<any>([]);

  const initFunction = async () => {
    setSearchValue("");
    const tempMasterData = await fetchUserGroupsAndUsers(
      setSupervisorList,
      setBillingteamList,
      setApproverList,
      setMasterList,
      setIsLoading
    );
    setMasterList(tempMasterData);
    setActiveGroupTab(activeGroupTab === "" ? "supervisor" : activeGroupTab);
  };

  useEffect(() => {
    initFunction();
  }, []);

  const openAddFormPopup = () => {
    setFormDetails({
      Id:
        activeGroupTab === "supervisor"
          ? supervisorList?.groupId
          : activeGroupTab === "billing"
          ? billingteamList?.groupId
          : approverList?.groupId,
      Users: [],
    });
    togglePopupVisibility(setPopupController, 0, "open", `Add Users`);
  };
  const handleChange = async (items: any[]): Promise<void> => {
    // Get users from active group
    const tempUserList =
      activeGroupTab === "supervisor"
        ? masterList?.supervisorList
        : activeGroupTab === "billing"
        ? masterList?.billingTeamList
        : masterList?.approverList;

    const resolvedUsers = await Promise.all(
      items.map(async (item: any) => {
        const email = item?.secondaryText;
        const user = await sp.web.ensureUser(email); // This returns user.Id (numeric)
        return {
          id: user?.data?.Id,
          email,
          name: item?.text,
        };
      })
    );
    const duplicateUsers = resolvedUsers?.filter((item) =>
      tempUserList?.some(
        (u: any) => u.userId === item.id || u.userEmail === item.email
      )
    );

    const errorMessage = duplicateUsers.map((u) => u.name).join(", ");

    setFormDetails((prev: any) => ({
      ...prev,
      Users: resolvedUsers,
      isValid: duplicateUsers.length === 0,
      errorMessage:
        duplicateUsers.length > 0
          ? `${errorMessage} already exists in this group`
          : "",
    }));
  };

  const popupInputs: any[] = [
    [
      <div key={1} style={{ width: "100%" }}>
        <label className="input-label">
          Select User
          <span style={{ color: "red", marginLeft: "2px" }}>*</span>
        </label>
        <PeoplePicker
          styles={popupMultiPeoplePickerStyle}
          context={props?.context}
          webAbsoluteUrl={props?.context?._pageContext?._site?.absoluteUrl}
          // titleText="Select Users"
          placeholder="Enter name"
          personSelectionLimit={5}
          showtooltip={true}
          defaultSelectedUsers={
            formDetails?.Users?.map(
              (item: any) => item.userEmail || item.Email || item.email
            ) || []
          }
          onChange={handleChange}
          resolveDelay={1000}
          principalTypes={[PrincipalType.User]}
        />
      </div>,
    ],
    [
      <div key={2}>
        <p style={{ fontSize: "15px", fontWeight: "500", margin: "0px" }}>
          Are you sure want to remove the user?
        </p>
      </div>,
    ],
  ];
  const submitAddUsersForm = () => {
    const existingUsers =
      activeGroupTab === "supervisor"
        ? masterList?.supervisorList
        : activeGroupTab === "billing"
        ? masterList?.billingTeamList
        : masterList?.approverList;
    userUpdateSubmission(
      formDetails?.Id,
      existingUsers,
      formDetails?.Users,
      initFunction,
      handleClosePopup,
      setToastResponse
    );
  };
  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "cancelBtn",
        disabled: false,
        startIcon: "pi pi-times-circle",
        onClick: () => {
          handleClosePopup(0);
        },
      },
      {
        text: "Submit",
        btnType: "primaryBtn",
        startIcon: "pi pi-check-circle",
        disabled: !formDetails?.isValid ? true : false,
        onClick: () => {
          submitAddUsersForm();
        },
      },
    ],
    [
      {
        text: "No",
        btnType: "cancelBtn",
        disabled: false,
        startIcon: "pi pi-times-circle",
        onClick: () => {
          handleClosePopup(1);
        },
      },
      {
        text: "Yes",
        btnType: "primaryBtn",
        disabled: false,
        startIcon: "pi pi-check-circle",
        onClick: () => {
          removeUserFunction(
            formDetails?.Id,
            formDetails?.Users,
            initFunction,
            handleClosePopup,
            setToastResponse
          );
        },
      },
    ],
  ];

  const actionBoadyTemplate = (rowData: any) => {
    return (
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <Tooltip title="Delete">
          <DeleteIcon
            onClick={() => {
              console.log(masterList);

              setFormDetails({
                Id:
                  activeGroupTab === "supervisor"
                    ? supervisorList?.groupId
                    : activeGroupTab === "billing"
                    ? billingteamList?.groupId
                    : approverList?.groupId,
                Users: (activeGroupTab === "supervisor"
                  ? masterList?.supervisorList
                  : activeGroupTab === "billing"
                  ? masterList?.billingTeamList
                  : masterList?.approverList
                )?.filter((user: any) => user?.userId !== rowData?.userId),
              });
              togglePopupVisibility(
                setPopupController,
                1,
                "open",
                `Confirmation`
              );
            }}
            sx={{
              cursor: "pointer",
              backgroundColor: "#ffebee",
              padding: "4px",
              borderRadius: "6px",
              fontSize: "24px",
              color: "#f44336",
              "&:hover": {
                backgroundColor: "#ffcdd2",
              },
            }}
          />
        </Tooltip>
      </div>
    );
  };

  const searchAndFilter = (value: string) => {
    setSearchValue(value);
    const key = activeGroupTab;

    const fullList =
      key === "supervisor"
        ? masterList?.supervisorList
        : key === "billing"
        ? masterList?.billingTeamList
        : masterList?.approverList;

    const filtered = fullList.filter((user: any) =>
      user?.userName?.toLowerCase().includes(value?.toLowerCase())
    );

    if (key === "supervisor") {
      setSupervisorList({ ...supervisorList, users: filtered });
    } else if (key === "billing") {
      setBillingteamList({ ...billingteamList, users: filtered });
    } else {
      setApproverList({ ...approverList, users: filtered });
    }
  };

  return (
    <div className={styles.user_Container}>
      <CustomToast
        toastResponse={toastResponse}
        setToastResponse={setToastResponse}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className={styles.tab_container}>
          <button
            className={`${
              activeGroupTab === "supervisor"
                ? styles.activeTabBtn
                : styles.tabBtn
            }`}
            onClick={() => {
              setActiveGroupTab("supervisor");
              setSearchValue("");
              setSupervisorList((prev: any) => {
                return { ...prev, users: masterList.supervisorList };
              });
            }}
            aria-pressed={activeGroupTab === "supervisor"}
            style={{ borderRadius: "3px" }}
          >
            Supervisor
          </button>
          <button
            className={`${
              activeGroupTab === "billing" ? styles.activeTabBtn : styles.tabBtn
            }`}
            onClick={() => {
              setActiveGroupTab("billing");
              setSearchValue("");
              setBillingteamList((prev: any) => {
                return { ...prev, users: masterList.billingTeamList };
              });
            }}
            aria-pressed={activeGroupTab === "billing"}
            style={{
              borderRadius: "3px",
            }}
          >
            Billing Team
          </button>
          <button
            className={`${
              activeGroupTab === "approver"
                ? styles.activeTabBtn
                : styles.tabBtn
            }`}
            onClick={() => {
              setActiveGroupTab("approver");
              setSearchValue("");
              setApproverList((prev: any) => {
                return { ...prev, users: masterList.approverList };
              });
            }}
            aria-pressed={activeGroupTab === "approver"}
            style={{ borderRadius: "3px" }}
          >
            Chief of Approval
          </button>
        </div>
      </div>
      <div className={styles.dashboardHeader}>
        {/* <span className={styles.heading}>Users Details</span> */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <CustomSearchInput
            width="330px"
            value={searchValue}
            placeholder="Search"
            disabled={isLoading}
            onChange={(value: string) => {
              searchAndFilter(value);
            }}
          />
          <CustomButton
            btnType="primaryBtn"
            // icon="pi pi-plus"
            onClick={openAddFormPopup}
            text="Add User"
          />
        </div>
      </div>
      <div className="custom-data-table">
        <DataTable
          value={
            activeGroupTab === "supervisor"
              ? supervisorList?.users
              : activeGroupTab === "billing"
              ? billingteamList?.users
              : approverList?.users
          }
          className="min_height_55vh"
          scrollable
          scrollHeight="55vh"
          style={{ minWidth: "100%", minHeight: "30Vh", maxHeight: "65vh" }}
          key={0}
          paginator={
            (activeGroupTab === "supervisor"
              ? supervisorList?.users?.length
              : activeGroupTab === "billing"
              ? billingteamList?.users?.length
              : approverList?.users?.length) > 10
          }
          rows={9}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} ${
            (activeGroupTab === "supervisor"
              ? supervisorList?.users?.length
              : activeGroupTab === "billing"
              ? billingteamList?.users?.length
              : approverList?.users?.length) === 1
              ? "record"
              : "records"
          }`}
          //   emptyMessage="No data found."
          emptyMessage={() => {
            return isLoading ? (
              <div
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  height: "20vh",
                  padding: "10px",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "center",
                }}
              >
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ fontSize: "2rem" }}
                />
              </div>
            ) : (
              <div style={{ padding: "10px" }}>No Data Found</div>
            );
          }}
        >
          <Column
            field="userId"
            header="S No"
            style={{ width: "10%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.sNo} isBold={true} />
            )}
          />
          <Column
            field="userName"
            header="User Name"
            style={{ width: "30%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.userName} isBold={false} />
            )}
          />
          <Column
            field="userEmail"
            header="User Email"
            style={{ width: "40%" }}
            body={(rowData) => <OnTextRender text={rowData?.userEmail} />}
          />
          <Column
            field="sNo"
            header="Action"
            style={{ width: "20%" }}
            body={actionBoadyTemplate}
          />
        </DataTable>
      </div>
      {popupController?.map((popupData: any, index: number) => (
        <Popup
          key={index}
          isLoading={false}
          PopupType={popupData.popupType}
          onHide={() => {
            togglePopupVisibility(setPopupController, index, "close");
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={popupActions[index]}
          visibility={popupData.open}
          content={popupInputs[index]}
          // response={popupResponse[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={
            popupData.popupType !== "custom" ? popupData.popupTitle : ""
          }
          errorMessage={!formDetails?.isValid ? formDetails?.errorMessage : ""}
        />
      ))}
    </div>
  );
};

export default UserConfig;
