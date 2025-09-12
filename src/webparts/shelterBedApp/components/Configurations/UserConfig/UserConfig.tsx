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

type IUser = {
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  sNo?: number;
  [key: string]: any;
};

type IGroup = {
  groupId: number;
  users: IUser[];
};

const emptyGroup = (): IGroup => ({ groupId: 0, users: [] });

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
      ".ms-BasePicker-input::placeholder": {},
      ".ms-BasePicker-text:after": { display: "none" },
      ".ms-BasePicker-text:hover": { border: "1px solid #b99223" },
      ".ms-TooltipHost": { fontSize: "13px", color: "#414141" },
      ".ms-PickerPersona-container": {
        background: "#e8e8e8",
        maxWidth: "auto",
        minWidth: "auto",
      },
      ".ms-PickerItem-removeButton": { display: "block" },
      ".ms-PickerItem-removeButton:focus": { background: "#555" },
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
  const handleClosePopup = (index: number) =>
    togglePopupVisibility(setPopupController, index, "close");

  const [toastResponse, setToastResponse] = useState<any>({
    severity: "",
    summary: "",
    detail: "",
    life: 3000,
  });

  // active tab and group id
  const [activeGroupTab, setActiveGroupTab] = useState<
    "supervisor" | "billing" | "approver"
  >("supervisor");
  const [activeGroupID, setActiveGroupID] = useState<number | null>(null);

  // Form details for add/delete
  const [formDetails, setFormDetails] = useState<any>({
    Id: null,
    Users: [],
    isValid: true,
    errorMessage: "",
  });

  const [searchValue, setSearchValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // originalLists keeps the immutable source data per group (from server)
  const [originalLists, setOriginalLists] = useState<{
    supervisor: IGroup;
    billing: IGroup;
    approver: IGroup;
  }>({
    supervisor: emptyGroup(),
    billing: emptyGroup(),
    approver: emptyGroup(),
  });

  // displayLists is what the UI shows (after search/filter). It is derived from originalLists and never replaces originalLists.
  const [displayLists, setDisplayLists] = useState<{
    supervisor: IGroup;
    billing: IGroup;
    approver: IGroup;
  }>({
    supervisor: emptyGroup(),
    billing: emptyGroup(),
    approver: emptyGroup(),
  });
  console.log(originalLists, displayLists);

  // ----- Helpers -----
  const normalizeUser = (u: any): IUser => {
    if (!u) return { userId: null, userEmail: null, userName: null };
    const userId =
      u.userId ?? u.UserId ?? u.ID ?? u.Id ?? u.IdNumber ?? u.id ?? null;
    const userEmail =
      u.userEmail ??
      u.Email ??
      u.email ??
      u.Mail ??
      u.login ??
      u.userPrincipalName ??
      null;
    const userName =
      u.userName ??
      u.Title ??
      u.TitleName ??
      u.displayName ??
      u.name ??
      u.Text ??
      u.text ??
      null;
    return {
      userId: userId ?? null,
      userEmail: userEmail ?? null,
      userName: userName ?? null,
    };
  };

  const addSno = (users: IUser[]) =>
    users.map((u, idx) => ({ ...u, sNo: idx + 1 }));

  function normalizeGroupShape(raw: any): IGroup {
    if (!raw) return emptyGroup();

    // if already normalized
    if (raw.groupId !== undefined && raw.users) {
      const users = Array.isArray(raw.users)
        ? raw.users.map(normalizeUser)
        : [];
      // don't trust 0, only set if > 0
      const gid = raw.groupId && raw.groupId > 0 ? raw.groupId : null;
      return { groupId: gid, users };
    }

    // if array of users
    if (Array.isArray(raw)) {
      return { groupId: 0, users: raw.map(normalizeUser) };
    }

    // object with users or arrays
    const usersArr =
      raw.users ?? raw.userList ?? raw.usersList ?? raw.Items ?? [];
    let gid =
      raw.groupId ?? raw.groupID ?? raw.GroupId ?? raw.ID ?? raw.Id ?? null;

    // fix: treat 0 as invalid
    gid = gid && gid > 0 ? gid : null;

    const users = Array.isArray(usersArr) ? usersArr.map(normalizeUser) : [];
    return { groupId: gid, users };
  }

  // ----- Init / Fetch -----
  const initFunction = async () => {
    setSearchValue("");
    setIsLoading(true);

    // We pass callbacks the same way your existing service expects (it appears to accept setter callbacks).
    // Each callback we provide will normalize the incoming payload into our originalLists & displayLists.
    fetchUserGroupsAndUsers(
      (sup: any) => {
        console.log("sup", sup);

        const ng = normalizeGroupShape(sup);
        console.log("ng", ng);
        setOriginalLists((prev) => ({ ...prev, supervisor: ng }));
        setDisplayLists((prev) => ({
          ...prev,
          supervisor: { ...ng, users: addSno(ng.users), groupId: ng.groupId },
        }));
        if (!activeGroupID && ng.groupId) setActiveGroupID(ng.groupId);
      },
      (bill: any) => {
        const ng = normalizeGroupShape(bill);
        setOriginalLists((prev) => ({ ...prev, billing: ng }));
        setDisplayLists((prev) => ({
          ...prev,
          billing: { ...ng, users: addSno(ng.users), groupId: ng.groupId },
        }));
      },
      (app: any) => {
        const ng = normalizeGroupShape(app);
        setOriginalLists((prev) => ({ ...prev, approver: ng }));
        setDisplayLists((prev) => ({
          ...prev,
          approver: { ...ng, users: addSno(ng.users), groupId: ng.groupId },
        }));
      },
      (master: any) => {
        // some implementations return a master object with keys; support that too
        if (master) {
          const sup = normalizeGroupShape(
            master.supervisorList ??
              master.supervisor ??
              master.supervisorListData ??
              []
          );
          const bill = normalizeGroupShape(
            master.billingTeamList ??
              master.billing ??
              master.billingTeamListData ??
              []
          );
          const app = normalizeGroupShape(
            master.approverList ??
              master.approver ??
              master.approverListData ??
              []
          );
          setOriginalLists({ supervisor: sup, billing: bill, approver: app });
          setDisplayLists({
            supervisor: { ...sup, users: addSno(sup.users) },
            billing: { ...bill, users: addSno(bill.users) },
            approver: { ...app, users: addSno(app.users) },
          });
          if (!activeGroupID && sup.groupId) setActiveGroupID(sup.groupId);
        }
      },
      setIsLoading
    );
  };

  useEffect(() => {
    initFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Utility to get keys based on activeGroupTab
  const groupKeyForTab = (tab: "supervisor" | "billing" | "approver") =>
    tab === "supervisor"
      ? "supervisor"
      : tab === "billing"
      ? "billing"
      : "approver";

  // ----- PeoplePicker change handler (Add users) -----
  const handleChange = async (items: any[]): Promise<void> => {
    // resolve selected users to normalized shape
    const resolvedUsers: IUser[] = await Promise.all(
      (items || []).map(async (item: any) => {
        // PeoplePicker item shape varies; try to get an email/login
        const email =
          item?.secondaryText ??
          item?.login ??
          item?.id ??
          item?.key ??
          item?.text ??
          null;
        try {
          const ensured = email ? await sp.web.ensureUser(email) : null;
          const id = ensured?.data?.Id ?? ensured?.data?.Id ?? null;
          return normalizeUser({
            userId: id,
            userEmail: email,
            userName: item?.text ?? item?.title ?? item?.name,
          });
        } catch (e) {
          // fallback — still include the entry with null id if ensureUser failed
          return normalizeUser({
            userId: null,
            userEmail: email,
            userName: item?.text ?? item?.title ?? item?.name,
          });
        }
      })
    );

    const key = groupKeyForTab(activeGroupTab);
    const base = originalLists[key] ?? emptyGroup();

    // duplicate check comparing by userId (if present) or email
    const duplicateUsers = resolvedUsers.filter((r) =>
      base.users.some(
        (u) =>
          (u.userId && r.userId && u.userId === r.userId) ||
          (u.userEmail &&
            r.userEmail &&
            u.userEmail.toLowerCase() === (r.userEmail || "").toLowerCase())
      )
    );
    const errorMessage = duplicateUsers
      .map((d) => d.userName ?? d.userEmail ?? "")
      .join(", ");

    setFormDetails((prev: any) => ({
      ...prev,
      Users: resolvedUsers,
      isValid: duplicateUsers.length === 0,
      errorMessage: duplicateUsers.length
        ? `${errorMessage} already exists in this group`
        : "",
    }));
  };

  // ----- Open add popup -----
  const openAddFormPopup = () => {
    const key = groupKeyForTab(activeGroupTab);
    const current = originalLists[key] ?? emptyGroup();
    setFormDetails({
      Id: current.groupId,
      Users: [],
      isValid: true,
      errorMessage: "",
    });
    togglePopupVisibility(setPopupController, 0, "open", `Add Users`);
  };

  // ----- Submit add users -----
  const submitAddUsersForm = async () => {
    const key = groupKeyForTab(activeGroupTab);
    const current = originalLists[key] ?? emptyGroup();

    const existingUsersCopy = (current.users || []).map((u: IUser) => ({
      ...u,
    }));
    const newUsersCopy = (formDetails?.Users || []).map((u: IUser) => ({
      ...u,
    }));

    // call service with copies only — do not pass our state references
    try {
      // preserve the old callback pattern — userUpdateSubmission may expect callbacks
      const groupIdToUse = formDetails?.Id ?? current.groupId ?? null;
      userUpdateSubmission(
        groupIdToUse,
        existingUsersCopy,
        newUsersCopy,
        () => {
          // success callback: refresh data and close popup
          initFunction();
          handleClosePopup(0);
        },
        handleClosePopup,
        setToastResponse
      );
    } catch (err) {
      // best-effort: show toast
      setToastResponse({
        severity: "error",
        summary: "Add failed",
        detail: String(err),
        life: 3000,
      });
    }
  };

  // ----- Remove user flow -----
  const removeUserFromGroup = (userId: number | null) => {
    const key = groupKeyForTab(activeGroupTab);
    const current = originalLists[key] ?? emptyGroup();
    const userToRemove =
      current.users.find((u) => u.userId === userId) ??
      current.users.find(
        (u) =>
          u.userEmail &&
          String(u.userEmail).toLowerCase() === String(userId).toLowerCase()
      );

    setFormDetails({
      Id: current.groupId,
      Users: userToRemove ? [userToRemove] : [],
      isValid: true,
      errorMessage: "",
    });
    togglePopupVisibility(setPopupController, 1, "open", `Confirmation`);
  };

  const confirmDelete = async () => {
    debugger;
    const key = groupKeyForTab(activeGroupTab);
    const current = originalLists[key] ?? emptyGroup();
    const usersToDelete = (formDetails?.Users || []).map((u: IUser) => ({
      ...u,
    }));

    try {
      removeUserFunction(
        current.groupId,
        usersToDelete,
        (current.users || []).map((u) => ({ ...u })),
        () => {
          // on success: refresh lists and close confirmation
          initFunction();
          handleClosePopup(1);
        },
        handleClosePopup,
        setToastResponse
      );
    } catch (err) {
      setToastResponse({
        severity: "error",
        summary: "Delete failed",
        detail: String(err),
        life: 3000,
      });
    }
  };

  // ----- Search — only affects displayLists (never mutate originalLists) -----
  const searchAndFilter = (value: string) => {
    setSearchValue(value);
    const key = groupKeyForTab(activeGroupTab);
    const base = originalLists[key] ?? emptyGroup();

    if (!value || value.trim() === "") {
      setDisplayLists((prev) => ({
        ...prev,
        [key]: { ...base, users: addSno(base.users) },
      }));
      return;
    }

    const filtered = base.users.filter((u) =>
      (u.userName ?? "").toString().toLowerCase().includes(value.toLowerCase())
    );
    setDisplayLists((prev) => ({
      ...prev,
      [key]: { ...base, users: addSno(filtered) },
    }));
  };

  // ----- UI rendering helpers -----
  const getDisplayedUsers = () => {
    const key = groupKeyForTab(activeGroupTab);
    return displayLists[key]?.users ?? [];
  };

  // Popup inputs & actions
  const popupInputs: any[] = [
    [
      <div key={1} style={{ width: "100%" }}>
        <label className="input-label">
          Select User
          <span style={{ color: "red", marginLeft: "2px" }}>*</span>
        </label>
        <PeoplePicker
          key={1}
          styles={popupMultiPeoplePickerStyle}
          context={props?.context}
          webAbsoluteUrl={props?.context?._pageContext?._site?.absoluteUrl}
          placeholder="Enter here"
          personSelectionLimit={5}
          showtooltip={false}
          ensureUser={true}
          defaultSelectedUsers={
            (formDetails?.Users || []).map(
              (item: any) => item.userEmail || item.Email || item.email
            ) || []
          }
          onChange={handleChange}
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

  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "closeBtn",
        disabled: false,
        startIcon: "pi pi-times-circle",
        onClick: () => handleClosePopup(0),
      },
      {
        text: "Submit",
        btnType: "primaryBtn",
        startIcon: "pi pi-check-circle",
        disabled: !formDetails?.isValid,
        onClick: submitAddUsersForm,
      },
    ],
    [
      {
        text: "No",
        btnType: "closeBtn",
        disabled: false,
        startIcon: "pi pi-times-circle",
        onClick: () => handleClosePopup(1),
      },
      {
        text: "Yes",
        btnType: "primaryBtn",
        disabled: false,
        startIcon: "pi pi-check-circle",
        onClick: confirmDelete,
      },
    ],
  ];

  const actionBodyTemplate = (rowData: IUser) => (
    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
      <Tooltip title="Delete">
        <DeleteIcon
          onClick={() => removeUserFromGroup(rowData?.userId ?? null)}
          sx={{
            cursor: "pointer",
            backgroundColor: "#ffebee",
            padding: "4px",
            borderRadius: "6px",
            fontSize: "24px",
            color: "#f44336",
            "&:hover": { backgroundColor: "#ffcdd2" },
          }}
        />
      </Tooltip>
    </div>
  );

  // Tab click handler to reset display list from original
  const onTabClick = (tab: "supervisor" | "billing" | "approver") => {
    setActiveGroupTab(tab);
    const key = groupKeyForTab(tab);
    const base = originalLists[key] ?? emptyGroup();
    setActiveGroupID(base.groupId ?? null);
    setSearchValue("");
    setDisplayLists((prev) => ({
      ...prev,
      [key]: { ...base, users: addSno(base.users) },
    }));
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
            onClick={() => onTabClick("supervisor")}
            aria-pressed={activeGroupTab === "supervisor"}
            style={{ borderRadius: "3px" }}
          >
            Supervisor
          </button>
          <button
            className={`${
              activeGroupTab === "billing" ? styles.activeTabBtn : styles.tabBtn
            }`}
            onClick={() => onTabClick("billing")}
            aria-pressed={activeGroupTab === "billing"}
            style={{ borderRadius: "3px" }}
          >
            Billing Team
          </button>
          <button
            className={`${
              activeGroupTab === "approver"
                ? styles.activeTabBtn
                : styles.tabBtn
            }`}
            onClick={() => onTabClick("approver")}
            aria-pressed={activeGroupTab === "approver"}
            style={{ borderRadius: "3px" }}
          >
            Chief of Approval
          </button>
        </div>
      </div>

      <div className={styles.dashboardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <CustomSearchInput
            width="330px"
            value={searchValue}
            placeholder="Search"
            disabled={isLoading}
            onChange={(v: string) => searchAndFilter(v)}
          />
          <CustomButton
            btnType="primaryBtn"
            onClick={openAddFormPopup}
            text="Add User"
          />
        </div>
      </div>

      <div className="custom-data-table">
        <DataTable
          value={getDisplayedUsers()}
          className="min_height_59vh"
          scrollable
          scrollHeight="59vh"
          style={{ minWidth: "100%", minHeight: "30Vh", maxHeight: "65vh" }}
          key={0}
          paginator={(getDisplayedUsers() || []).length > 10}
          rows={9}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} ${
            (getDisplayedUsers() || []).length === 1 ? "record" : "records"
          }`}
          emptyMessage={() =>
            isLoading ? (
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
            )
          }
        >
          <Column
            field="sNo"
            header="S No"
            style={{ width: "10%" }}
            body={(rowData: IUser) => (
              <OnTextRender
                text={rowData?.sNo !== undefined ? String(rowData.sNo) : ""}
                isBold={true}
              />
            )}
          />
          <Column
            field="userName"
            header="User Name"
            style={{ width: "30%" }}
            body={(rowData: IUser) => (
              <OnTextRender
                text={
                  rowData?.userName !== undefined
                    ? String(rowData.userName)
                    : ""
                }
                isBold={false}
              />
            )}
          />
          <Column
            field="userEmail"
            header="User Email"
            style={{ width: "40%" }}
            body={(rowData: IUser) => (
              <OnTextRender
                text={
                  rowData?.userEmail !== undefined
                    ? String(rowData.userEmail)
                    : ""
                }
              />
            )}
          />
          <Column
            field="action"
            header="Action"
            style={{ width: "20%" }}
            body={actionBodyTemplate}
          />
        </DataTable>
      </div>

      {popupController?.map((popupData: any, index: number) => (
        <Popup
          key={index}
          isLoading={false}
          PopupType={popupData.popupType}
          onHide={() =>
            togglePopupVisibility(setPopupController, index, "close")
          }
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={popupActions[index]}
          visibility={popupData.open}
          content={popupInputs[index]}
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
