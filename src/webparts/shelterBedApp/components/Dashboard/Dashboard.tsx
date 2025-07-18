import * as React from "react";
import styles from "../Dashboard/Dashboard.module.scss";
import { Button } from "primereact/button";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { sp } from "@pnp/sp/presets/all";
import * as moment from "moment";
import { IconField } from "primereact/iconfield";
import { Dropdown } from "primereact/dropdown";
import { SPLists } from "../../../../Config/Config";
import Loader from "../Loader/Loader";

interface Iuser {
  Id: number | null;
  Title: string;
  Email: string;
}
interface IProps {
  toastFunc: (
    serverity: string,
    summary: string,
    msg: string,
    life?: number
  ) => void;
  allUser: Iuser[];
  CurrentUser: string;
  CurrentRole: string;
  setconfigpage: any;
}
interface IData {
  id: number | null;
  requestedby: string;
  requestedemail: string;
  bedoccupiedon: Date | null;
  dateofrequest: Date | null;
  comments: string;
  status: string;
  prevstatus: string;
  client: string;
  clientemail: string;
  files: Ifile[];
  nextlevel: number | null;
  approvaljson: string;
  approvercomments: string;
  bed: string;
  shelter: string;
  closedate: Date | null;
  requestlog: IRequestLogData[];
  bedneededon: Date | null;
}
interface IRequestLogData {
  id: number | null;
  requestId: number | null;
  status: string;
  role: string;
  userid: number | null;
  username: string;
  comments: string;
}
interface IBedData {
  id: number | null;
  bed: string;
  shelterid: number | null;
  sheltername: string;
  status: string;
}
interface Ifile {
  etag: string;
  name: string;
  url: string;
  blop: any;
  type: string;
}
let requestDetails: IData = {
  id: null,
  requestedby: "",
  requestedemail: "",
  bedoccupiedon: null,
  dateofrequest: null,
  comments: "",
  status: "",
  prevstatus: "",
  client: "",
  clientemail: "",
  files: [],
  nextlevel: null,
  approvaljson: "",
  approvercomments: "",
  bed: "",
  shelter: "",
  closedate: null,
  requestlog: [],
  bedneededon: null,
};
interface IDialogDetails {
  condition: boolean;
  data: any;
  type: "add" | "edit" | "delete" | "view" | "workflow" | "";
}
let _dialog: IDialogDetails = {
  condition: false,
  data: requestDetails,
  type: "",
};
interface IDrpdownOptions {
  code: string;
  name: string;
}
interface IDrpdowns {
  bed: IDrpdownOptions[];
  shelter: IDrpdownOptions[];
  filterclient: IDrpdownOptions[];
  filterstatus: IDrpdownOptions[];
  status: IDrpdownOptions[];
}
interface IFilterkeys {
  status: IDrpdownOptions[];
  client: IDrpdownOptions[];
  search: string;
}
const Dashboard = (props: IProps): JSX.Element => {
  let _dd: IDrpdowns = {
    bed: [],
    shelter: [],
    filterclient: [],
    filterstatus: [],
    status: [],
  };
  const _fkeys: IFilterkeys = {
    status: [],
    client: [],
    search: "",
  };
  const [dialog, setdialog] = useState<IDialogDetails>(_dialog);
  const [masterData, setmasterData] = useState<any[]>([]);
  const [masterBedData, setmasterBedData] = useState<IBedData[]>([]);
  const [masterBedLogData, setmasterBedLogData] = useState<IBedData[]>([]);
  const [drpdowns, setdrpdowns] = useState<IDrpdowns>({ ..._dd });
  const [filterkeys, setfilterkeys] = useState<IFilterkeys>({ ..._fkeys });
  const [filterData, setfilterData] = useState<IData[]>([]);
  const [loader, setloader] = useState<boolean>(false);
  //Star function
  const asterisk = (): any => {
    return <span style={{ color: "red" }}>*</span>;
  };
  //Data onchange save
  const onChangeHandler = (key: string, value: any): void => {
    let _formData = { ...dialog };
    if (key === "files") {
      let _files: Ifile[] = [..._formData.data.files];
      for (let item of value) {
        _files.push({
          etag: "",
          name: item.name,
          url: "",
          blop: item,
          type: "New",
        });
      }
      _formData.data[`${key}`] = _files;
    } else if (key === "shelter") {
      let _dropdown = { ...drpdowns };
      let _bedDropDown: any = [...masterBedData].filter(
        (e: any) => e.shelterid === value
      );
      for (let data of _bedDropDown) {
        _dropdown.bed.push({
          code: data.id,
          name: data.bed,
        });
      }
      setdrpdowns({ ..._dropdown });
      _formData.data[key] = value;
    } else if (key === "bed") {
      _formData.data[key] = value;
    } else {
      _formData.data[key] = value;
    }
    setdialog({ ..._formData });
  };
  // err function
  const errFunction = (err: string, funcName: string): void => {
    console.log(err, funcName);
  };
  //get bedlog data
  const getBedLogData = (
    _allData: any,
    _dropdown: any,
    _masterBedData: any
  ) => {
    sp.web.lists
      .getByTitle(SPLists.BedLogList)
      .items.select("*", "Shelter/ID,Shelter/Title", "Bed/Id", "Bed/Title")
      .expand("Shelter", "Bed")
      .filter(`AvailabilityStatus eq 'Occupied'`)
      .top(5000)
      .get()
      .then(async (items) => {
        let _masterBedLogData: IBedData[] = [];
        for (let data of items) {
          _masterBedLogData.push({
            id: data.Id,
            bed: data.Bed.Id,
            shelterid: data.Shelter.ID,
            sheltername: data.Shelter.Title,
            status: data.AvailabilityStatus,
          });
        }
        setmasterBedData([..._masterBedData]);
        setmasterData([..._allData]);
        setfilterData([..._allData]);
        setdrpdowns({ ..._dropdown });
        setmasterBedLogData(_masterBedLogData);
        setloader(false);
      })
      .catch((err) => errFunction("Error get bed log items:", err));
  };
  //get bed details
  const getBedDetails = (_allData: any, _dropdown: any) => {
    sp.web.lists
      .getByTitle(SPLists.BedConfigList)
      .items.select("*", "Shelter/ID,Shelter/Title")
      .expand("Shelter")
      .top(5000)
      .filter(`IsDelete ne 1`)
      .get()
      .then(async (items) => {
        let _masterBedData: IBedData[] = [];
        for (let data of items) {
          _masterBedData.push({
            id: data.Id,
            bed: data.Title,
            shelterid: data.Shelter.ID,
            sheltername: data.Shelter.Title,
            status: data.AvailabilityStatus,
          });
        }
        getBedLogData(_allData, _dropdown, _masterBedData);
      })
      .catch((err) => errFunction("Error get bed config items:", err));
  };
  //get request data
  const getRequest = (_masterRequestLogData: any) => {
    sp.web.lists
      .getByTitle(SPLists.RequestList)
      .items.select(
        "*",
        "RequestedBy/Id",
        "RequestedBy/EMail",
        "AttachmentFiles",
        "Bed/Id",
        "Bed/Title",
        "Shelter/Id",
        "Shelter/Title"
      )
      .expand("RequestedBy", "AttachmentFiles", "Bed", "Shelter")
      .top(5000)
      .filter(`IsDelete ne 1`)
      .get()
      .then(async (items) => {
        let _allData = [];
        let _dropdown: any = { ...drpdowns };
        for (let data of items) {
          const arrAttach: any[] = await data?.AttachmentFiles?.map(
            (val: any) => {
              return {
                etag: "",
                name: val?.FileName,
                url: val?.ServerRelativeUrl,
                blop: val?.ServerRelativeUrl,
                type: "Inlist",
              };
            }
          );
          let requestlogdata: any = _masterRequestLogData?.filter(
            (e: any) => e.requestId === data.Id
          );

          _allData.push({
            id: data.Id,
            requestedby: props.allUser
              ? props.allUser.filter((e) => e.Id === data.RequestedBy.Id)[0]
                  ?.Title
              : "",
            requestedemail: props.allUser
              ? props.allUser.filter((e) => e.Id === data.RequestedBy.Id)[0]
                  ?.Email
              : "",
            bedoccupiedon: data.BedOccupiedOn
              ? new Date(data.BedOccupiedOn)
              : null,
            bedneededon: data.BedNeededOn ? new Date(data.BedNeededOn) : null,
            dateofrequest: moment(data.DateofRequest).format("DD/MM/YYYY"),
            comments: data.Comments,
            status: data.Status,
            prevstatus: data.Status,
            client: data.Client,
            clientemail: data.ClientEmail,
            files: arrAttach || [],
            nextlevel: data.NextLevel,
            approvercomments: "",
            approvaljson: JSON.parse(data.ApprovalJson),
            bed: data.Bed?.Id ? data.Bed.Id : null,
            shelter: data.Shelter?.Id ? data.Shelter.Id : null,
            closedate: data.BedClosedOn ? data.BedClosedOn : null,
            requestlog: requestlogdata ? requestlogdata : [],
          });

          _dropdown.filterclient.push({
            code: data.Id,
            name: data.Client,
          });
          if (
            !_dropdown.filterstatus.some(
              (item: any) => item.name === data.Status
            )
          ) {
            _dropdown.filterstatus.push({
              code: data.Id,
              name: data.Status,
            });
          }
        }
        // setdrpdowns({ ..._dropdown });
        getBedDetails(_allData, _dropdown);
      })
      .catch((err) => errFunction("Error get request items:", err));
  };
  //get request log data
  const getRequestLogData = () => {
    sp.web.lists
      .getByTitle(SPLists.RequestLogList)
      .items.select("*", "User/Id,User/EMail")
      .expand("User")
      .top(5000)
      .get()
      .then(async (items) => {
        let _masterRequestLogData: IRequestLogData[] = [];
        for (let data of items) {
          _masterRequestLogData.push({
            id: data.Id,
            requestId: data.RequestIdId,
            status: data.Status,
            role: data.Role,
            userid: data.User.Id,
            username: props.allUser
              ? props.allUser.filter((e) => e.Id === data.User.Id)[0]?.Title
              : "",
            comments: data.Comments,
          });
        }
        getRequest(_masterRequestLogData);
      })
      .catch((err) => errFunction("Error get bed log items:", err));
  };
  //Add request
  const addRequest = (requestData: any) => {
    let approvaljsonvalue = [
      {
        Level: 2,
        Role: "Billing Team",
        RoleEmail: "",
        Status: "Pending",
      },
      {
        Level: 3,
        Role: "Chief of Approval",
        RoleEmail: "",
        Status: "Pending",
      },
    ];

    let _curData: any = {
      BedNeededOn: requestData.bedneededon,
      Comments: requestData.comments,
      Client: requestData.client,
      ClientEmail: requestData.clientemail,
      Status: "Submitted by Supervisor",
      RequestedById: props.allUser.filter(
        (e) => e.Email == props.CurrentUser
      )[0].Id,
      DateofRequest: new Date(),
      NextLevel: 2,
      ApprovalJson: JSON.stringify(approvaljsonvalue),
    };

    let _saveFile: any = [];
    for (let saveFile of requestData.files) {
      if (saveFile.type === "New") {
        _saveFile.push({
          name: saveFile.name,
          content: saveFile.blop,
        });
      }
    }
    sp.web.lists
      .getByTitle(SPLists.RequestList)
      .items.add(_curData)
      .then(async (res) => {
        if (_saveFile.length > 0) {
          await sp.web.lists
            .getByTitle(SPLists.RequestList)
            .items.getById(res.data.Id)
            .attachmentFiles.addMultiple(_saveFile);
        }
        let logData: any = {
          RequestIdId: res.data.Id,
          Role: props.CurrentRole,
          UserId: props.allUser.filter((e) => e.Email == props.CurrentUser)[0]
            .Id,
          Status: "Submitted",
          Comments: requestData.approvercomments
            ? requestData.approvercomments
            : "",
        };
        await sp.web.lists
          .getByTitle(SPLists.RequestLogList)
          .items.add(logData)
          .then(async (res) => {
            props.toastFunc("success", "Success", "Request added successfully");
            setdialog({ ..._dialog });
            getRequestLogData();
          });
      })
      .catch((err: any) => errFunction(err, "addRequest"));
  };
  //update request
  const updateRequest = (requestData: any, isDelete: boolean) => {
    let approvaljsonvalue = [
      {
        Level: 2,
        Role: "Billing Team",
        RoleEmail: "",
        Status: "Pending",
      },
      {
        Level: 3,
        Role: "Chief of Approval",
        RoleEmail: "",
        Status: "Pending",
      },
    ];
    let _curData: any = {
      BedOccupiedOn: requestData.bedoccupiedon,
      BedNeededOn: requestData.bedneededon,
      Comments: requestData.comments,
      Client: requestData.client,
      ClientEmail: requestData.clientemail,
      Status:
        requestData.prevstatus === "Rejected by Billing Team" ||
        requestData.prevstatus === "Rejected by COA"
          ? "Submitted by Supervisor"
          : requestData.prevstatus === "Approved"
          ? "Occupied"
          : requestData.status,
      IsDelete: isDelete,
      NextLevel:
        requestData.prevstatus === "Rejected by Billing Team" ||
        requestData.prevstatus === "Rejected by COA"
          ? 2
          : requestData.nextlevel,
      ApprovalJson:
        requestData.prevstatus === "Rejected by Billing Team" ||
        requestData.prevstatus === "Rejected by COA"
          ? JSON.stringify(approvaljsonvalue)
          : JSON.stringify(requestData.approvaljson),
      ShelterId: requestData.shelter ? requestData.shelter : null,
      BedId: requestData.bed ? requestData.bed : null,
      BedClosedOn: requestData.prevstatus === "Occupied" ? new Date() : null,
    };
    let _saveFile: any = [];
    for (let saveFile of requestData.files) {
      if (saveFile.type === "New") {
        _saveFile.push({
          name: saveFile.name,
          content: saveFile.blop,
        });
      }
    }
    let _deleteFile: any = [];
    for (let deleteFile of requestData.files) {
      if (deleteFile.type === "Delete") {
        _deleteFile.push({
          name: deleteFile.name,
          content: deleteFile.blop,
        });
      }
    }

    sp.web.lists
      .getByTitle(SPLists.RequestList)
      .items.getById(requestData.id)
      .update(_curData)
      .then(async (res) => {
        if (_deleteFile.length > 0) {
          for (let i = 0; i < _deleteFile.length; i++) {
            await sp.web.lists
              .getByTitle(SPLists.RequestList)
              .items.getById(requestData.id)
              .attachmentFiles.getByName(_deleteFile[i].name)
              .delete();
          }
        } else if (_saveFile.length > 0) {
          await sp.web.lists
            .getByTitle(SPLists.RequestList)
            .items.getById(requestData.id)
            .attachmentFiles.addMultiple(_saveFile);
        } else if (
          !isDelete &&
          requestData.prevstatus !== "Approved" &&
          requestData.prevstatus !== "Occupied" &&
          requestData.prevstatus !== "Submitted by Supervisor"
        ) {
          let logData: any = {
            RequestIdId: requestData.id,
            Role: props.CurrentRole,
            UserId: props.allUser.filter((e) => e.Email == props.CurrentUser)[0]
              .Id,
            Status: "Submitted",
            Comments: "",
          };
          await sp.web.lists
            .getByTitle(SPLists.RequestLogList)
            .items.add(logData);
        } else if (requestData.prevstatus === "Approved") {
          let BedConfigData: any = {
            AvailabilityStatus: "Occupied",
            Client: requestData.client,
            ClientEmail: requestData.clientemail,
            BedOccupiedOn: requestData.bedoccupiedon,
          };
          let BedlogData: any = {
            BedId: requestData.bed,
            AvailabilityStatus: "Occupied",
            ShelterId: requestData.shelter,
            Client: requestData.client,
            ClientEmail: requestData.clientemail,
            BedOccupiedOn: requestData.bedoccupiedon,
          };
          await sp.web.lists
            .getByTitle(SPLists.BedConfigList)
            .items.getById(requestData.bed)
            .update(BedConfigData);
          await sp.web.lists
            .getByTitle(SPLists.BedLogList)
            .items.add(BedlogData);
        } else if (requestData.prevstatus === "Occupied") {
          let BedConfigData: any = {
            AvailabilityStatus: "Available",
            Client: "",
            ClientEmail: "",
            BedOccupiedOn: null,
          };
          let BedlogData: any = {
            BedId: requestData.bed,
            AvailabilityStatus: "Closed",
            ShelterId: requestData.shelter,
            Client: requestData.client,
            ClientEmail: requestData.clientemail,
            BedOccupiedOn: requestData.bedoccupiedon,
            BedClosedOn: new Date(),
          };
          let bedlogItem = masterBedLogData.find(
            (e) => e.bed === requestData.bed
          );
          let bedlogId: number | null = bedlogItem ? bedlogItem.id : null;
          await sp.web.lists
            .getByTitle(SPLists.BedConfigList)
            .items.getById(requestData.bed)
            .update(BedConfigData);
          await sp.web.lists
            .getByTitle(SPLists.BedLogList)
            .items.getById(Number(bedlogId))
            .update(BedlogData);
        }
        isDelete
          ? props.toastFunc(
              "success",
              "Success",
              "Request deleted successfully"
            )
          : props.toastFunc(
              "success",
              "Success",
              "Request updated successfully"
            );
        setdialog({ ..._dialog });
        getRequestLogData();
      })
      .catch((err) => errFunction(err, "updateRequest"));
  };
  //approver function
  const approverfunction = (requestData: any, BtnType: string) => {
    let approvaljsonvalue: any = requestData.approvaljson.map((item: any) =>
      item.Level === requestData.nextlevel
        ? { ...item, RoleEmail: props.CurrentUser, Status: "Approved" }
        : item
    );
    let _curData: any = {
      Status:
        requestData.nextlevel === 2 && BtnType === "Approved"
          ? "Approved by Billing Team"
          : requestData.nextlevel === 2 && BtnType === "Rejected"
          ? "Rejected by Billing Team"
          : requestData.nextlevel === 3 && BtnType === "Approved"
          ? "Approved"
          : requestData.nextlevel === 3 && BtnType === "Rejected"
          ? "Rejected by COA"
          : "",
      NextLevel:
        requestData.nextlevel === 2 && BtnType === "Approved"
          ? 3
          : BtnType === "Rejected"
          ? 0
          : null,
      ApprovalJson: JSON.stringify(approvaljsonvalue),
    };
    let logData: any = {
      RequestIdId: requestData.id,
      Role: props.CurrentRole,
      UserId: props.allUser.filter((e) => e.Email == props.CurrentUser)[0].Id,
      Status: BtnType === "Approved" ? "Approved" : "Rejected",
      Comments: requestData.approvercomments,
    };
    sp.web.lists
      .getByTitle(SPLists.RequestList)
      .items.getById(requestData.id)
      .update(_curData)
      .then(async (res) => {
        await sp.web.lists
          .getByTitle(SPLists.RequestLogList)
          .items.add(logData)
          .then(async (res) => {
            props.toastFunc(
              "success",
              "Success",
              `Request ${BtnType} successfully`
            );
            setdialog({ ..._dialog });
            getRequestLogData();
          });
      })
      .catch((err) => errFunction(err, "Approverfunction"));
  };
  //Form Validation
  const requestValidation = (BtnType: string): any => {
    const validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (dialog.data.client === "") {
      props.toastFunc("error", "Error", "Please enter the client name");
    } else if (dialog.data.clientemail === "") {
      props.toastFunc("error", "Error", "Please enter the client email");
    } else if (
      dialog.data.clientemail !== "" &&
      dialog.data.clientemail.match(validRegex)
        ? false
        : true
    ) {
      props.toastFunc("error", "Error", "Please enter the correct email");
    } else if (dialog.data.bedneededon === null) {
      props.toastFunc("error", "Error", "Please select the bed needed on");
    } else if (dialog.data.approvercomments === "" && BtnType === "Rejected") {
      props.toastFunc("error", "Error", "Please enter approver comments");
    } else if (
      dialog.data.bedoccupiedon === null &&
      dialog.data.prevstatus === "Approved"
    ) {
      props.toastFunc("error", "Error", "Please select the bed occupied on");
    } else if (
      dialog.data.shelter === "" &&
      dialog.data.prevstatus === "Approved"
    ) {
      props.toastFunc("error", "Error", "Please select shelter");
    } else if (
      dialog.data.bed === "" &&
      dialog.data.prevstatus === "Approved"
    ) {
      props.toastFunc("error", "Error", "Please select bed");
    } else {
      setloader(true);
      if (BtnType === "Submit") {
        if (dialog.type === "add") {
          addRequest({ ...dialog.data });
        } else {
          updateRequest({ ...dialog.data }, false);
        }
      } else {
        approverfunction({ ...dialog.data }, BtnType);
      }
    }
  };
  //Attachment delete
  const handleDelete = (indexToDelete: number) => {
    const files = [...dialog.data.files];
    const file = files[indexToDelete];
    if (file.type === "New") {
      files.splice(indexToDelete, 1); // Remove "New" file
    } else {
      files[indexToDelete] = { ...file, type: "Delete" }; // Mark as "Delete"
    }
    setdialog({ ...dialog, data: { ...dialog.data, files } });
  };
  //Request image
  const requestorTemplate = (data: any) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={`/_layouts/15/userphoto.aspx?size=M&accountname=${data.requestedemail}`}
          alt="wait"
          style={{
            marginRight: 10,
            width: 30,
            height: 30,
            borderRadius: "50%",
            objectFit: "fill",
          }}
        ></img>
        <span className={styles.columnValue} title={data.requestedby}>
          {data.requestedby}
        </span>
      </div>
    );
  };
  //Status Color
  const statusTemplate = (data: any) => {
    let _stsObj: any = {
      borderColor: "",
      bgColor: "",
      color: "",
    };
    if (
      data.prevstatus == "Rejected by Billing Team" ||
      data.prevstatus == "Rejected by COA"
    ) {
      _stsObj = {
        borderColor: "#f77575",
        bgColor: "#f7e6e6",
        color: "#d32929",
      };
    } else if (data.prevstatus == "Approved") {
      _stsObj = {
        borderColor: "#AED9AA",
        bgColor: "#F8FFF8",
        color: "#1A8812",
      };
    } else if (data.prevstatus == "Closed") {
      _stsObj = {
        borderColor: "#FFBF00",
        bgColor: "#ffbf001a",
        color: "#a78110",
      };
    } else if (data.prevstatus == "Occupied") {
      _stsObj = {
        borderColor: "#95d9e2",
        bgColor: "#e6f4f7",
        color: "#085655",
      };
    } else {
      _stsObj = {
        borderColor: "#007bff",
        bgColor: "#b9d6f566",
        color: "#0b4687",
      };
    }
    return (
      <div
        style={{
          border: `1px solid ${_stsObj.borderColor}`,
          backgroundColor: _stsObj.bgColor,
          color: _stsObj.color,
        }}
        className={styles.pillDesign}
        title={data.prevstatus}
      >
        {data.prevstatus == "Rejected by Billing Team" ||
        data.prevstatus == "Rejected by COA" ? (
          <i className="pi pi-times-circle" />
        ) : data.prevstatus == "Approved" ? (
          <i className="pi pi-check-circle" />
        ) : data.prevstatus == "Closed" ? (
          <i className="pi pi-lock" />
        ) : data.prevstatus == "Occupied" ? (
          <i className="pi pi-users" />
        ) : (
          <i className="pi pi-check" />
        )}
        {data.prevstatus}
      </div>
    );
  };
  //Action template
  const actionTemplate = (item: any) => {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {props.CurrentRole === "Supervisor" ? (
          <>
            <i
              className="pi pi-eye"
              title="view"
              style={{ color: "#0a194b", cursor: "pointer" }}
              onClick={() =>
                setdialog({ condition: true, data: item, type: "view" })
              }
            />

            {(item.nextlevel === 0 ||
              item.nextlevel === 2 ||
              item.prevstatus === "Approved" ||
              item.prevstatus === "Occupied") &&
              props.CurrentRole === "Supervisor" &&
              item.requestedemail === props.CurrentUser && (
                <i
                  className="pi pi-pen-to-square"
                  title="edit"
                  style={{ color: "#1A8812", cursor: "pointer" }}
                  onClick={() => {
                    if (item.bed) {
                      let _dropdown = { ...drpdowns };
                      let _bedDropDown: any[] = [...masterBedData].filter(
                        (e: any) => e.id === item.bed
                      );
                      for (let data of _bedDropDown) {
                        _dropdown.bed.push({
                          code: data.id,
                          name: data.bed,
                        });
                      }
                      setdrpdowns({ ..._dropdown });
                    }
                    if (item.prevstatus === "Occupied") {
                      let _dropdown = { ...drpdowns };
                      _dropdown.status = [
                        { code: item.prevstatus, name: item.prevstatus },
                        { code: "Closed", name: "Closed" },
                      ];
                      let ShelterDrpDown: any = masterBedData.find(
                        (e) => e.shelterid === item.shelter
                      );
                      _dropdown.shelter = [
                        {
                          code: item.shelter,
                          name: ShelterDrpDown.sheltername,
                        },
                      ];
                      setdrpdowns({ ..._dropdown });
                    } else if (item.prevstatus === "Approved") {
                      let _dropdown = { ...drpdowns };

                      let ShelterDrpDown: any = masterBedData.filter(
                        (e) => e.status === "Available"
                      );

                      if (ShelterDrpDown.length > 0) {
                        for (let data of ShelterDrpDown) {
                          const shelterCode = data.shelterid;
                          const shelterName = data.sheltername;
                          if (
                            !_dropdown.shelter.some(
                              (item: any) => data.code === shelterCode
                            )
                          ) {
                            _dropdown.shelter.push({
                              code: shelterCode,
                              name: shelterName,
                            });
                          }
                        }
                        setdrpdowns({ ..._dropdown });
                      }
                    }

                    setdialog({ condition: true, data: item, type: "edit" });
                  }}
                />
              )}
            {item.requestedemail === props.CurrentUser ? (
              <i
                className="pi pi-trash"
                title="delete"
                style={{ color: "#f54242", cursor: "pointer" }}
                onClick={() => {
                  setdialog({ condition: true, data: item, type: "delete" });
                }}
              />
            ) : null}
          </>
        ) : item.nextlevel === 3 &&
          props.CurrentRole === "Chief of Approval" ? (
          <>
            <i
              className="pi pi-file-check"
              title="Review"
              style={{ color: "#005bbb", cursor: "pointer" }}
              onClick={() =>
                setdialog({ condition: true, data: item, type: "view" })
              }
            />
          </>
        ) : item.nextlevel === 2 && props.CurrentRole === "Billing Team" ? (
          <>
            <i
              className="pi pi-file-check"
              title="Review"
              style={{ color: "#005bbb", cursor: "pointer" }}
              onClick={() =>
                setdialog({ condition: true, data: item, type: "view" })
              }
            />
          </>
        ) : null}
        <i
          className="pi pi-history"
          title="Review"
          style={{ color: "#005bbb", cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            setdialog({
              condition: true,
              data: item,
              type: "workflow",
            });
          }}
        />
      </div>
    );
  };
  //filter function
  const filterFunc = (key: string, value: any): void => {
    let _filterkeys: any = { ...filterkeys };
    let _filterdata: IData[] = [...masterData];

    _filterkeys[key] = value;
    if (_filterkeys.status.code) {
      _filterdata = _filterdata.filter(
        (_d: IData) => _filterkeys.status?.name === _d.status
      );
    }

    if (_filterkeys.client.code) {
      _filterdata = _filterdata.filter(
        (_d: IData) => _filterkeys.client?.name === _d.client
      );
    }
    if (_filterkeys.search.trim() != "") {
      _filterdata = _filterdata.filter((_d: IData) => {
        let _searchValue: string = value.toLowerCase();
        return (
          (_d.client && _d.client.toLowerCase().includes(_searchValue)) ||
          (_d.requestedby &&
            _d.requestedby.toLowerCase().includes(_searchValue)) ||
          (_d.dateofrequest &&
            _d.dateofrequest.toString().includes(_searchValue)) ||
          (_d.bedoccupiedon &&
            _d.bedoccupiedon.toString().includes(_searchValue)) ||
          (_d.status && _d.status.toLowerCase().includes(_searchValue))
        );
      });
    }

    setfilterkeys({ ..._filterkeys });
    setfilterData([..._filterdata]);
  };
  useEffect(() => {
    setloader(true);
    getRequestLogData();
  }, []);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className={styles.maincontainer}>
          <div>
            <section className={styles.headingSection}>
              <div className={styles.heading}>
                Dashboard
                <hr style={{ borderColor: "#b99223" }}></hr>
              </div>

              <div>
                {/* filter section */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <div className="dashBoardFilter">
                    <div
                      className="icon-field"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        borderColor: "#b99223",
                        borderRadius: 4,
                        gap: "5px",
                      }}
                    >
                      <i
                        className="pi pi-cog"
                        title="Config"
                        style={{
                          color: "#0a194b",
                          cursor: "pointer",
                          fontSize: "20px",
                          paddingRight: "10px",
                        }}
                        onClick={() => {
                          props.setconfigpage(true);
                          // <MainComponent />;
                        }}
                      />
                      <Dropdown
                        value={filterkeys.client}
                        onChange={(e) => filterFunc("client", e.value)}
                        options={drpdowns.filterclient}
                        optionLabel="name"
                        placeholder="Select a client"
                      />
                      <Dropdown
                        value={filterkeys.status}
                        onChange={(e) => filterFunc("status", e.value)}
                        options={drpdowns.filterstatus}
                        optionLabel="name"
                        placeholder="Select a status"
                      />
                      <IconField iconPosition="left">
                        <InputIcon
                          className="pi pi-search"
                          style={{ padding: "0px 5px", fontSize: "16px" }}
                        ></InputIcon>
                        <InputText
                          placeholder="Search"
                          onChange={(e) => filterFunc("search", e.target.value)}
                          value={filterkeys.search}
                        />
                      </IconField>
                      <Button
                        label=""
                        icon="pi pi-sync"
                        onClick={() => {
                          setfilterData([...masterData]);
                          setfilterkeys({ ..._fkeys });
                        }}
                      />
                    </div>
                  </div>

                  {props.CurrentRole === "Supervisor" ? (
                    <Button
                      label="New Request"
                      icon="pi pi-plus-circle"
                      onClick={() =>
                        setdialog({
                          ..._dialog,
                          data: { ...requestDetails },
                          condition: true,
                          type: "add",
                        })
                      }
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </section>
          </div>
          {/* table */}
          <div className={styles.dataTable}>
            <DataTable
              emptyMessage="No data found"
              //   className={!masterData.length && "nodata"}
              value={filterData}
              tableStyle={{ width: "100%" }}
              //   selectionMode={"single"}
              paginator={filterData.length ? true : false}
              rows={10}
            >
              <Column
                field="requestId"
                header="Request Id"
                style={{ width: "10%" }}
                body={(item: any) => {
                  return (
                    // <div className={styles.columnValue} title={item.id}>
                    //   {item.id}
                    // </div>
                    <div
                      className={styles.columnValue}
                      title={`MSH-${item.id.toString().padStart(4, "0")}`}
                    >
                      {`MSH-${item.id.toString().padStart(4, "0")}`}
                    </div>
                  );
                }}
              />
              <Column
                field=""
                header="Requestor By"
                body={requestorTemplate}
                style={{ width: "14%" }}
              />
              <Column
                field="date"
                header="Date of Request"
                style={{ width: "10%" }}
                body={(item: any) => {
                  return (
                    <div
                      className={styles.columnValue}
                      title={item.dateofrequest}
                    >
                      {item.dateofrequest}
                    </div>
                  );
                }}
              />
              <Column
                field="bedoccupiedon"
                header="Bed Occupied On"
                style={{ width: "10%" }}
                body={(item: any) => {
                  return (
                    <div
                      className={styles.columnValue}
                      title={item.bedoccupiedon}
                    >
                      {item.bedoccupiedon
                        ? moment(item.bedoccupiedon).format("DD/MM/YYYY")
                        : "-"}
                    </div>
                  );
                }}
              />
              <Column
                field="client"
                header="Client"
                style={{ width: "10%" }}
                body={(item: any) => {
                  return (
                    <div className={styles.columnValue} title={item.client}>
                      {item.client}
                    </div>
                  );
                }}
              />
              <Column
                field="status"
                header="Status"
                body={statusTemplate}
                style={{
                  width: "15%",
                }}
              />
              <Column
                field=""
                header="Action"
                body={(item) => {
                  return actionTemplate(item);
                }}
                style={{ width: "10%" }}
              />
            </DataTable>
          </div>
          {/* modal popup */}
          {dialog.condition &&
          (dialog.type === "add" ||
            dialog.type === "edit" ||
            dialog.type === "view") ? (
            <Dialog
              header={`${
                dialog.type === "add"
                  ? "New"
                  : dialog.type === "view" && props.CurrentRole === "Supervisor"
                  ? "View"
                  : dialog.data.nextlevel === 2 || dialog.data.nextlevel === 3
                  ? "Approve"
                  : "Edit"
              } Request`}
              visible={dialog.condition}
              style={{ width: "60%" }}
              onHide={(): void => setdialog({ ..._dialog })}
              className="dialogCloseIcon"
            >
              <div className={`${styles.modalBodyFlex}  dashboard-design`}>
                <div className={styles.fieldssm}>
                  <label>
                    Client Name {dialog.type === "view" ? "" : asterisk()}
                  </label>
                  <InputText
                    placeholder="Enter here"
                    value={dialog.data.client}
                    onChange={(e) => onChangeHandler("client", e.target.value)}
                    disabled={
                      dialog.type === "view" ||
                      dialog.data.prevstatus === "Approved" ||
                      dialog.data.prevstatus === "Occupied"
                        ? true
                        : false
                    }
                  />
                </div>

                <div className={styles.fieldssm}>
                  <label>
                    Client Email {dialog.type === "view" ? "" : asterisk()}
                  </label>
                  <InputText
                    placeholder="Enter here"
                    value={dialog.data.clientemail}
                    onChange={(e) =>
                      onChangeHandler("clientemail", e.target.value)
                    }
                    disabled={
                      dialog.type === "view" ||
                      dialog.data.prevstatus === "Approved" ||
                      dialog.data.prevstatus === "Occupied"
                        ? true
                        : false
                    }
                  />
                </div>
                <div className={styles.fieldssm}>
                  <label>
                    Bed Needed On {dialog.type === "view" ? "" : asterisk()}
                  </label>
                  <Calendar
                    value={dialog.data.bedneededon}
                    onChange={(e) => onChangeHandler("bedneededon", e.value)}
                    placeholder="Select start date"
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="FormCalender"
                    disabled={
                      dialog.type === "view" ||
                      dialog.data.prevstatus === "Approved" ||
                      dialog.data.prevstatus === "Occupied"
                        ? true
                        : false
                    }
                  />
                </div>
              </div>
              <div className={styles.modalBodyFlexCmtsFile}>
                <div className={styles.fieldssm} style={{ width: "36%" }}>
                  <label>Comments</label>
                  <InputTextarea
                    rows={4}
                    placeholder="Enter here"
                    style={{ resize: "none", height: "100px" }}
                    onChange={(e) =>
                      onChangeHandler("comments", e.target.value)
                    }
                    value={dialog.data.comments}
                    disabled={
                      dialog.type === "view" ||
                      dialog.data.prevstatus === "Approved" ||
                      dialog.data.prevstatus === "Occupied"
                        ? true
                        : false
                    }
                  />
                </div>
                <div className={styles.fieldssm} style={{ width: "62%" }}>
                  <div className={styles.attachementBtn}>
                    {/* <div style={{ width: "100%", display: "flex" }}> */}
                    {dialog.type !== "view" &&
                    dialog.data.prevstatus !== "Approved" &&
                    dialog.data.prevstatus !== "Occupied" ? (
                      <div style={{ width: "20%" }}>
                        <label htmlFor="file" className={styles.filelabel}>
                          Choose file
                        </label>
                        <input
                          type="file"
                          style={{ display: "none" }}
                          id="file"
                          onChange={(event) =>
                            onChangeHandler("files", event.target.files)
                          }
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {dialog.data.files.length > 0 && (
                      <div
                        style={{
                          width: "50%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                          height: "100px",
                          overflow: "auto",
                        }}
                      >
                        {dialog.data.files
                          .filter((e: any) => e.type !== "Delete") // Only show non-deleted files
                          .map((e: any, index: number) => (
                            <div key={index} className={styles.FileCardDesign}>
                              {e.type === "Inlist" ? (
                                <div
                                  className={styles.fileName}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    window.open(
                                      window.location.origin + e.url + "?web=1"
                                    );
                                  }}
                                >
                                  {e.name}
                                </div>
                              ) : (
                                <div className={styles.fileName}>{e.name}</div>
                              )}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {dialog.type !== "view" ? (
                                  <i
                                    className="pi pi-times"
                                    style={{
                                      color: "red",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => handleDelete(index)}
                                  ></i>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {(dialog.data.nextlevel === 2 || dialog.data.nextlevel === 3) &&
              props.CurrentRole !== "Supervisor" ? (
                <div className={styles.fieldssm} style={{ width: "36%" }}>
                  <label>Approver Comments</label>
                  <InputTextarea
                    rows={4}
                    placeholder="Enter here"
                    style={{ resize: "none", height: "100px" }}
                    onChange={(e) =>
                      onChangeHandler("approvercomments", e.target.value)
                    }
                    value={dialog.data.approvercomments}
                  />
                </div>
              ) : (
                ""
              )}
              {(dialog.data.prevstatus === "Approved" ||
                dialog.data.prevstatus === "Occupied") &&
              dialog.type === "edit" ? (
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    justifyContent: "space-between",
                  }}
                >
                  <div className={styles.fieldssm}>
                    <label>
                      Bed Occupied On
                      {dialog.data.prevstatus === "Occupied" ? "" : asterisk()}
                    </label>
                    <Calendar
                      value={dialog.data.bedoccupiedon}
                      onChange={(e) =>
                        onChangeHandler("bedoccupiedon", e.value)
                      }
                      placeholder="Select start date"
                      dateFormat="dd/mm/yy"
                      showIcon
                      className="FormCalender"
                      disabled={
                        dialog.data.prevstatus === "Occupied" ? true : false
                      }
                    />
                  </div>
                  <div className={styles.fieldssm}>
                    <label>
                      Shelter
                      {dialog.data.prevstatus === "Occupied" ? "" : asterisk()}
                    </label>
                    <Dropdown
                      value={dialog.data.shelter || ""}
                      onChange={(e) => onChangeHandler("shelter", e.value)}
                      options={drpdowns.shelter}
                      optionLabel="name"
                      optionValue="code"
                      placeholder="Select a shelter"
                      disabled={
                        dialog.data.prevstatus === "Occupied" ? true : false
                      }
                    />
                  </div>
                  <div className={styles.fieldssm}>
                    <label>
                      Bed
                      {dialog.data.prevstatus === "Occupied" ? "" : asterisk()}
                    </label>
                    <Dropdown
                      value={dialog.data.bed}
                      onChange={(e) => onChangeHandler("bed", e.value)}
                      options={drpdowns.bed}
                      optionLabel="name"
                      optionValue="code"
                      placeholder="Select a bed"
                      disabled={
                        dialog.data.prevstatus === "Occupied" ? true : false
                      }
                    />
                  </div>
                </div>
              ) : (
                ""
              )}
              {dialog.data.prevstatus === "Occupied" ? (
                <div className={styles.fieldssm}>
                  <label>Status {asterisk()}</label>
                  <Dropdown
                    value={dialog.data.status}
                    onChange={(e) => onChangeHandler("status", e.value)}
                    options={drpdowns.status}
                    optionLabel="name"
                    optionValue="code"
                    placeholder="Select a status"
                  />
                </div>
              ) : (
                ""
              )}
              <div className={styles.modalFooter}>
                <Button
                  className={styles.cancelBtn}
                  label={dialog.type === "view" ? "Close" : "Cancel"}
                  icon="pi pi-times-circle"
                  iconPos="left"
                  onClick={() => setdialog({ ..._dialog })}
                />
                {dialog.type !== "view" ? (
                  <Button
                    className={styles.activeBtn}
                    label={dialog.type === "add" ? "Save" : "Update"}
                    icon="pi pi-send"
                    iconPos="left"
                    onClick={() => requestValidation("Submit")}
                  />
                ) : (dialog.data.nextlevel === 2 ||
                    dialog.data.nextlevel === 3) &&
                  props.CurrentRole !== "Supervisor" ? (
                  <>
                    <Button
                      className={styles.rejectBtn}
                      label="Rejected"
                      icon="pi pi-send"
                      iconPos="left"
                      onClick={() => requestValidation("Rejected")}
                    />
                    <Button
                      className={styles.approveBtn}
                      label="Approved"
                      icon="pi pi-send"
                      iconPos="left"
                      onClick={() => requestValidation("Approved")}
                    />
                  </>
                ) : null}
              </div>
            </Dialog>
          ) : dialog.type === "delete" ? (
            <Dialog
              header="Delete Confirmation"
              visible={dialog.condition}
              style={{ width: "27%" }}
              className="delPopup"
              onHide={(): void => setdialog({ ..._dialog })}
            >
              <p style={{ margin: 0, paddingBottom: 14 }}>
                Are you sure, you want to delete this request ?
              </p>

              <div className={styles.modalFooter}>
                <Button
                  className={styles.cancelBtn}
                  label="No"
                  icon="pi pi-times-circle"
                  iconPos="left"
                  onClick={() => setdialog({ ..._dialog })}
                />
                <Button
                  className={styles.activeBtn}
                  label="Yes"
                  icon="pi pi-trash"
                  iconPos="left"
                  onClick={() => {
                    updateRequest(dialog.data, true);
                  }}
                />
              </div>
            </Dialog>
          ) : dialog.type === "workflow" ? (
            <Dialog
              header="Request workflow"
              visible={dialog.condition}
              style={{ width: "50%" }}
              className="workflowPopup requestlog-Design"
              onHide={(): void => setdialog({ ..._dialog })}
              draggable={false}
            >
              <DataTable
                emptyMessage="No workflow found"
                value={dialog.data.requestlog}
                paginator={false}
                rows={10}
                className="workflowconfigView"
              >
                <Column
                  field="role"
                  header="Role"
                  // body={role}
                  style={{ width: "25%" }}
                ></Column>
                <Column
                  field="username"
                  header="Name"
                  // body={username}
                  style={{ width: "25%" }}
                ></Column>
                <Column
                  field="status"
                  header="Status"
                  // body={""}
                  style={{ width: "25%" }}
                ></Column>
              </DataTable>

              <div className={styles.modalFooter}>
                <Button
                  className={styles.cancelBtn}
                  label="Close"
                  icon="pi pi-times-circle"
                  iconPos="left"
                  onClick={() => setdialog({ ..._dialog })}
                />
              </div>
            </Dialog>
          ) : null}
        </div>
      )}
    </>
  );
};

export default Dashboard;
