/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @rushstack/no-new-null */

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
import { OnTextRender } from "../../../../Utils/dataTable";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VisibilityIcon from "@mui/icons-material/Visibility";
// import VerifiedIcon from "@mui/icons-material/Verified";
import TaskIcon from "@mui/icons-material/Task";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Tooltip from "@mui/material/Tooltip";
import {
  fetchBedRequest,
  fetchBedsDetails,
  fetchBedslogs,
} from "../../../../Services/RequestServices";
import CustomButton from "../Common/Buttons/Buttons";

const logo = require("../../assets/images/mystis_logo_image.jpg");
const docIcon = require("../../assets/images/doc.png");
const imageIcon = require("../../assets/images/image.png");
const xlsIcon = require("../../assets/images/xls.png");
const pdfIcon = require("../../assets/images/pdf.png");
const txtIcon = require("../../assets/images/txt.png");
const documentIcon = require("../../assets/images/document.png");

interface Iuser {
  Id: number | undefined;
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
  context: any;
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
const requestDetails: IData = {
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
  validation?: {
    key: string;
    idValid: boolean;
    errorMsg: string;
  };
}
const _dialog: IDialogDetails = {
  condition: false,
  data: requestDetails,
  type: "",
  validation: {
    key: "",
    idValid: true,
    errorMsg: "",
  },
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
  const _dd: IDrpdowns = {
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
    return <span style={{ color: "red", marginLeft: "2px" }}>*</span>;
  };
  //Data onchange save
  const onChangeHandler = (key: string, value: any): void => {
    const _formData = { ...dialog };
    if (key === "files") {
      const _files: Ifile[] = [..._formData.data.files];
      for (const item of value) {
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
      const _dropdown = { ...drpdowns };
      _dropdown.bed = [];
      const _bedDropDown: any = [...masterBedData].filter(
        (e: any) => e.shelterid === value
      );
      for (const data of _bedDropDown) {
        if (data?.status === "Available") {
          _dropdown.bed.push({
            code: data.id,
            name: data.bed,
          });
        }
      }
      setdrpdowns({ ..._dropdown });
      _formData.data[key] = value;
    } else if (key === "bed") {
      _formData.data[key] = value;
    } else {
      _formData.data[key] = value;
    }
    setdialog({
      ..._formData,
      validation: { key: "", idValid: true, errorMsg: "" },
    });
  };
  // err function
  const errFunction = (err: string, funcName: string): void => {
    console.log(err, funcName);
  };

  //Add request
  const addRequest = (requestData: any) => {
    const approvaljsonvalue = [
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

    const _curData: any = {
      BedNeededOn: requestData.bedneededon,
      Comments: requestData.comments,
      Client: requestData.client,
      ClientEmail: requestData.clientemail,
      Status: "Submitted by Supervisor",
      RequestedById: props.allUser.filter(
        (e) => e.Email === props.CurrentUser
      )[0].Id,
      DateofRequest: new Date(),
      NextLevel: 2,
      ApprovalJson: JSON.stringify(approvaljsonvalue),
    };

    const _saveFile: any = [];
    for (const saveFile of requestData.files) {
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
      .then(async (requestRes) => {
        if (_saveFile.length > 0) {
          await sp.web.lists
            .getByTitle(SPLists.RequestList)
            .items.getById(requestRes.data.Id)
            .attachmentFiles.addMultiple(_saveFile)
            .then((attchRes) => console.log("attchRes", attchRes));
        }
        const logData: any = {
          RequestIdId: requestRes.data.Id,
          Role: props.CurrentRole,
          UserId: props.allUser.filter((e) => e.Email === props.CurrentUser)[0]
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
            const tempNewRequest = {
              id: requestRes.data.Id,
              requestedby: props.allUser.filter(
                (e) => e.Email === props.CurrentUser
              )[0].Title,
              requestedemail: props.allUser.filter(
                (e) => e.Email === props.CurrentUser
              )[0].Email,
              bedoccupiedon: null,
              bedneededon: requestData.bedneededon
                ? new Date(requestData.bedneededon)
                : null,
              dateofrequest: moment(new Date()).format("DD/MM/YYYY"),
              comments: requestData.comments,
              status: "Submitted by Supervisor",
              prevstatus: "Submitted by Supervisor",
              client: requestData.client,
              clientemail: requestData.clientemail,
              files: requestData.files?.map((file: any) => {
                return {
                  name: file.name,
                  blop: `${props?.context?._pageContext?._site?.serverRelativeUrl}/Lists/${SPLists.RequestList}/Attachments/${requestRes.data.Id}/${file.name}`,
                  type: "Inlist",
                  url: `${props?.context?._pageContext?._site?.serverRelativeUrl}/Lists/${SPLists.RequestList}/Attachments/${requestRes.data.Id}/${file.name}`,
                };
              }),
              nextlevel: 2,
              approvercomments: "",
              approvaljson: JSON.parse(_curData.ApprovalJson),
              bed: null,
              shelter: null,
              closedate: null,
              requestlog: [
                {
                  id: res?.data?.Id,
                  requestId: logData?.RequestIdId,
                  status: logData?.Status,
                  role: logData?.Role,
                  userid: logData?.UserId,
                  username: props.allUser.filter(
                    (e) => e.Email === props.CurrentUser
                  )[0].Title,
                  comments: requestData.approvercomments
                    ? requestData.approvercomments
                    : "",
                },
              ],
            };
            setfilterData((prev: any) => {
              return [tempNewRequest, ...prev];
            });
            setmasterBedData((prev: any) => {
              return [tempNewRequest, ...prev];
            });
            setdialog({ ..._dialog });
            props.toastFunc("success", "Success", "Request added successfully");
            // getRequestLogData();
            setloader(false);
          });
      })
      .catch((err: any) => errFunction(err, "addRequest"));
  };
  //update request
  const updateRequest = (requestData: any, isDelete: boolean) => {
    const approvaljsonvalue = [
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
    const _curData: any = {
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
    const _saveFile: any = [];
    for (const saveFile of requestData.files) {
      if (saveFile.type === "New") {
        _saveFile.push({
          name: saveFile.name,
          content: saveFile.blop,
        });
      }
    }
    const _deleteFile: any = [];
    for (const deleteFile of requestData.files) {
      if (deleteFile.type === "Delete") {
        _deleteFile.push({
          name: deleteFile.name,
          content: deleteFile.blop,
        });
      }
    }
    const _tempFile: any = [];
    for (const deleteFile of requestData.files) {
      if (deleteFile.type !== "Delete") {
        _tempFile.push({
          name: deleteFile.name,
          blop: `${props?.context?._pageContext?._site?.serverRelativeUrl}/Lists/${SPLists.RequestList}/Attachments/${requestData.id}/${deleteFile.name}`,
          type: "Inlist",
          url: `${props?.context?._pageContext?._site?.serverRelativeUrl}/Lists/${SPLists.RequestList}/Attachments/${requestData.id}/${deleteFile.name}`,
        });
      }
    }

    sp.web.lists
      .getByTitle(SPLists.RequestList)
      .items.getById(requestData.id)
      .update(_curData)
      .then(async (res) => {
        const tempNewRequest = {
          // id: requestData.id,
          // requestedby: props.allUser.filter(
          //   (e) => e.Email === props.CurrentUser
          // )[0].Title,
          // requestedemail: props.allUser.filter(
          //   (e) => e.Email === props.CurrentUser
          // )[0].Email,
          bedoccupiedon: requestData.bedoccupiedon,
          bedneededon: requestData.bedneededon
            ? new Date(requestData.bedneededon)
            : null,
          // dateofrequest: moment(new Date()).format("DD/MM/YYYY"),
          comments: requestData.comments,
          status:
            requestData.prevstatus === "Rejected by Billing Team" ||
            requestData.prevstatus === "Rejected by COA"
              ? "Submitted by Supervisor"
              : requestData.prevstatus === "Approved"
              ? "Occupied"
              : requestData.status,
          prevstatus:
            requestData.prevstatus === "Rejected by Billing Team" ||
            requestData.prevstatus === "Rejected by COA"
              ? "Submitted by Supervisor"
              : requestData.prevstatus === "Approved"
              ? "Occupied"
              : requestData.status,
          client: requestData.client,
          clientemail: requestData.clientemail,
          files: _tempFile || [],
          nextlevel:
            requestData.prevstatus === "Rejected by Billing Team" ||
            requestData.prevstatus === "Rejected by COA"
              ? 2
              : requestData.nextlevel,
          approvercomments: "",
          approvaljson: JSON.parse(_curData.ApprovalJson),
          shelter: requestData.shelter ? requestData.shelter : null,
          bed: requestData.bed ? requestData.bed : null,
          closedate: requestData.prevstatus === "Occupied" ? new Date() : null,
        };
        const logData: any = {
          RequestIdId: requestData.id,
          Role: props.CurrentRole,
          UserId: props.allUser.filter((e) => e.Email === props.CurrentUser)[0]
            .Id,
          Status:
            requestData.prevstatus === "Approved" ? "Bed Assigned" : "Closed",
          Comments: "",
        };
        let logResponseId: number | any = null;
        if (_deleteFile.length > 0) {
          for (let i = 0; i < _deleteFile.length; i++) {
            await sp.web.lists
              .getByTitle(SPLists.RequestList)
              .items.getById(requestData.id)
              .attachmentFiles.getByName(_deleteFile[i].name)
              .delete();
          }
        }
        if (_saveFile.length > 0) {
          await sp.web.lists
            .getByTitle(SPLists.RequestList)
            .items.getById(requestData.id)
            .attachmentFiles.addMultiple(_saveFile);
        }
        if (requestData.prevstatus === "Approved") {
          await sp.web.lists
            .getByTitle(SPLists.RequestLogList)
            .items.add(logData)
            .then((losResponse) => {
              logResponseId = losResponse?.data?.Id;
            });
        }
        if (
          requestData.prevstatus === "Occupied" &&
          requestData.status === "Closed"
        ) {
          await sp.web.lists
            .getByTitle(SPLists.RequestLogList)
            .items.add(logData)
            .then((losResponse) => {
              logResponseId = losResponse?.data?.Id;
            });
        }
        // if (
        //   !isDelete &&
        //   requestData.prevstatus !== "Approved" &&
        //   requestData.prevstatus !== "Occupied" &&
        //   requestData.prevstatus !== "Submitted by Supervisor"
        // ) {
        //   await sp.web.lists
        //     .getByTitle(SPLists.RequestLogList)
        //     .items.add(logData)
        //     .then((losResponse) => {
        //       logResponseId = losResponse?.data?.Id;
        //     });
        // }

        if (requestData.prevstatus === "Approved") {
          const BedConfigData: any = {
            AvailabilityStatus: "Occupied",
            Client: requestData.client,
            ClientEmail: requestData.clientemail,
            BedOccupiedOn: requestData.bedoccupiedon,
          };
          const BedlogData: any = {
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
          const BedConfigData: any = {
            AvailabilityStatus: "Available",
            Client: "",
            ClientEmail: "",
            BedOccupiedOn: null,
          };
          const BedlogData: any = {
            BedId: requestData.bed,
            AvailabilityStatus: "Closed",
            ShelterId: requestData.shelter,
            Client: requestData.client,
            ClientEmail: requestData.clientemail,
            BedOccupiedOn: requestData.bedoccupiedon,
            BedClosedOn: new Date(),
          };
          const bedlogItem = masterBedLogData.find(
            (e) => e.bed === requestData.bed
          );
          const bedlogId: number | null = bedlogItem ? bedlogItem.id : null;
          await sp.web.lists
            .getByTitle(SPLists.BedConfigList)
            .items.getById(requestData.bed)
            .update(BedConfigData);
          await sp.web.lists
            .getByTitle(SPLists.BedLogList)
            .items.getById(Number(bedlogId))
            .update(BedlogData);
        }
        if (isDelete) {
          props.toastFunc("success", "Success", "Request deleted successfully");
        } else {
          props.toastFunc("success", "Success", "Request updated successfully");
        }
        setdialog({ ..._dialog });
        setfilterData((prev: any[]) => {
          const existingIndex = prev.findIndex(
            (item) => item.id === requestData.id
          );
          if (isDelete) {
            return prev.filter((item) => item.ID !== requestData.id);
          }
          if (existingIndex !== -1) {
            const updated = [...prev].map((request) => {
              if (request?.id === requestData.id) {
                const tempLog = request?.requestlog;
                if (requestData.prevstatus === "Approved") {
                  tempLog.unshift({
                    id: logResponseId,
                    requestId: logData?.RequestIdId,
                    status: logData?.Status,
                    role: logData?.Role,
                    userid: logData?.UserId,
                    username: props.allUser.filter(
                      (e) => e.Email === props.CurrentUser
                    )[0].Title,
                    comments: requestData.approvercomments
                      ? requestData.approvercomments
                      : "",
                  });
                } else {
                  if (
                    requestData.prevstatus === "Occupied" &&
                    requestData.status === "Closed"
                  ) {
                    tempLog.unshift({
                      id: logResponseId,
                      requestId: logData?.RequestIdId,
                      status: logData?.Status,
                      role: logData?.Role,
                      userid: logData?.UserId,
                      username: props.allUser.filter(
                        (e) => e.Email === props.CurrentUser
                      )[0].Title,
                      comments: requestData.approvercomments
                        ? requestData.approvercomments
                        : "",
                    });
                  }
                }
                return { ...request, ...tempNewRequest, requestlog: tempLog };
              } else {
                return request;
              }
            });
            return updated;
          } else {
            return [tempNewRequest, ...prev];
          }
        });
        setmasterBedData((prev: any[]) => {
          const existingIndex = prev.findIndex(
            (item) => item.ID === requestData.id
          );
          if (isDelete) {
            return prev.filter((item) => item.ID !== requestData.id);
          }
          if (existingIndex !== -1) {
            const updated = [...prev].map((request) => {
              if (request?.id === requestData.id) {
                const tempLog = request?.requestlog;
                if (requestData.prevstatus === "Approved") {
                  tempLog.unshift({
                    id: logResponseId,
                    requestId: logData?.RequestIdId,
                    status: logData?.Status,
                    role: logData?.Role,
                    userid: logData?.UserId,
                    username: props.allUser.filter(
                      (e) => e.Email === props.CurrentUser
                    )[0].Title,
                    comments: requestData.approvercomments
                      ? requestData.approvercomments
                      : "",
                  });
                } else {
                  if (
                    requestData.prevstatus === "Occupied" &&
                    requestData.status === "Closed"
                  ) {
                    tempLog.unshift({
                      id: logResponseId,
                      requestId: logData?.RequestIdId,
                      status: logData?.Status,
                      role: logData?.Role,
                      userid: logData?.UserId,
                      username: props.allUser.filter(
                        (e) => e.Email === props.CurrentUser
                      )[0].Title,
                      comments: requestData.approvercomments
                        ? requestData.approvercomments
                        : "",
                    });
                  }
                }
                return { ...request, ...tempNewRequest, requestlog: tempLog };
              } else {
                return request;
              }
            });
            return updated;
          } else {
            return [tempNewRequest, ...prev];
          }
        });
        // getRequestLogData();
        setloader(false);
      })
      .catch((err) => errFunction(err, "updateRequest"));
  };
  //approver function
  const approverfunction = (requestData: any, BtnType: string) => {
    const approvaljsonvalue: any = requestData.approvaljson.map((item: any) =>
      item.Level === requestData.nextlevel
        ? { ...item, RoleEmail: props.CurrentUser, Status: "Approved" }
        : item
    );
    const _curData: any = {
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
    const logData: any = {
      RequestIdId: requestData.id,
      Role: props.CurrentRole,
      UserId: props.allUser.filter((e) => e.Email === props.CurrentUser)[0].Id,
      Status: BtnType === "Approved" ? "Approved" : "Rejected",
      Comments: requestData.approvercomments,
    };
    sp.web.lists
      .getByTitle(SPLists.RequestList)
      .items.getById(requestData.id)
      .update(_curData)
      .then(async (res) => {
        const tempNewRequest = {
          // id: requestData.id,
          // requestedby: props.allUser.filter(
          //   (e) => e.Email === props.CurrentUser
          // )[0].Title,
          // requestedemail: props.allUser.filter(
          //   (e) => e.Email === props.CurrentUser
          // )[0].Email,
          // bedoccupiedon: requestData.bedoccupiedon,
          // bedneededon: requestData.bedneededon
          //   ? new Date(requestData.bedneededon)
          //   : null,
          // dateofrequest: moment(new Date()).format("DD/MM/YYYY"),
          // comments: requestData.comments,
          status:
            requestData.nextlevel === 2 && BtnType === "Approved"
              ? "Approved by Billing Team"
              : requestData.nextlevel === 2 && BtnType === "Rejected"
              ? "Rejected by Billing Team"
              : requestData.nextlevel === 3 && BtnType === "Approved"
              ? "Approved"
              : requestData.nextlevel === 3 && BtnType === "Rejected"
              ? "Rejected by COA"
              : "",
          prevstatus:
            requestData.nextlevel === 2 && BtnType === "Approved"
              ? "Approved by Billing Team"
              : requestData.nextlevel === 2 && BtnType === "Rejected"
              ? "Rejected by Billing Team"
              : requestData.nextlevel === 3 && BtnType === "Approved"
              ? "Approved"
              : requestData.nextlevel === 3 && BtnType === "Rejected"
              ? "Rejected by COA"
              : "",
          // client: requestData.client,
          // clientemail: requestData.clientemail,
          // files: _saveFile || [],
          nextlevel:
            requestData.nextlevel === 2 && BtnType === "Approved"
              ? 3
              : BtnType === "Rejected"
              ? 0
              : null,
          // approvercomments: "",
          approvaljson: JSON.parse(_curData.ApprovalJson),
          // shelter: requestData.shelter ? requestData.shelter : null,
          // bed: requestData.bed ? requestData.bed : null,
          // closedate:
          //   requestData.prevstatus === "Occupied" ? new Date() : null,
        };
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
            setfilterData((prev: any[]) => {
              const existingIndex = prev.findIndex(
                (item) => item.id === requestData.id
              );
              if (existingIndex !== -1) {
                const updated = [...prev].map((request) => {
                  if (request?.id === requestData.id) {
                    const tempLog = request?.requestlog;
                    tempLog.unshift({
                      id: res?.data?.Id,
                      requestId: logData?.RequestIdId,
                      status: logData?.Status,
                      role: logData?.Role,
                      userid: logData?.UserId,
                      username: props.allUser.filter(
                        (e) => e.Email === props.CurrentUser
                      )[0].Title,
                      comments: requestData.approvercomments
                        ? requestData.approvercomments
                        : "",
                    });
                    return {
                      ...request,
                      ...tempNewRequest,
                      requestlog: tempLog,
                    };
                  } else {
                    return request;
                  }
                });
                return updated;
              } else {
                return [tempNewRequest, ...prev];
              }
            });
            setmasterBedData((prev: any[]) => {
              const existingIndex = prev.findIndex(
                (item) => item.ID === requestData.id
              );
              if (existingIndex !== -1) {
                const updated = [...prev].map((request) => {
                  if (request?.id === requestData.id) {
                    const tempLog = request?.requestlog;
                    tempLog.unshift({
                      id: res?.data?.Id,
                      requestId: logData?.RequestIdId,
                      status: logData?.Status,
                      role: logData?.Role,
                      userid: logData?.UserId,
                      username: props.allUser.filter(
                        (e) => e.Email === props.CurrentUser
                      )[0].Title,
                      comments: requestData.approvercomments
                        ? requestData.approvercomments
                        : "",
                    });
                    return {
                      ...request,
                      ...tempNewRequest,
                      requestlog: tempLog,
                    };
                    return { ...request, ...tempNewRequest };
                  } else {
                    return request;
                  }
                });
                return updated;
              } else {
                return [tempNewRequest, ...prev];
              }
            });
            setloader(false);
            // getRequestLogData();
          });
      })
      .catch((err) => errFunction(err, "Approverfunction"));
  };

  const requestValidation = (BtnType: string): any => {
    const validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (dialog.data.client === "") {
      // props.toastFunc("error", "Error", "Please enter the client name");
      setdialog((prev) => {
        return {
          ...prev,
          validation: {
            key: "client",
            idValid: false,
            errorMsg: "Please enter the client name",
          },
        };
      });
    } else if (dialog.data.clientemail === "") {
      // props.toastFunc("error", "Error", "Please enter the client email");
      setdialog((prev) => {
        return {
          ...prev,
          validation: {
            key: "clientemail",
            idValid: false,
            errorMsg: "Please enter the client email",
          },
        };
      });
    } else if (
      dialog.data.clientemail !== "" &&
      dialog.data.clientemail.match(validRegex)
        ? false
        : true
    ) {
      // props.toastFunc("error", "Error", "Please enter the correct email");
      setdialog((prev) => {
        return {
          ...prev,
          validation: {
            key: "clientemail",
            idValid: false,
            errorMsg: "Please enter the correct email",
          },
        };
      });
    } else if (dialog.data.bedneededon === null) {
      // props.toastFunc("error", "Error", "Please select the bed needed on");
      setdialog((prev) => {
        return {
          ...prev,
          validation: {
            key: "bedneededon",
            idValid: false,
            errorMsg: "Please select the bed needed on",
          },
        };
      });
    } else if (dialog.data.approvercomments === "" && BtnType === "Rejected") {
      // props.toastFunc("error", "Error", "Please enter approver comments");
      setdialog((prev) => {
        return {
          ...prev,
          validation: {
            key: "approvercomments",
            idValid: false,
            errorMsg: "Please enter approver comments",
          },
        };
      });
    } else if (
      dialog.data.bedoccupiedon === null &&
      dialog.data.prevstatus === "Approved"
    ) {
      // props.toastFunc("error", "Error", "Please select the bed occupied on");
      setdialog((prev) => {
        return {
          ...prev,
          validation: {
            key: "bedoccupiedon",
            idValid: false,
            errorMsg: "Please select the bed occupied on",
          },
        };
      });
    } else if (
      dialog.data.shelter === null &&
      dialog.data.prevstatus === "Approved"
    ) {
      // props.toastFunc("error", "Error", "Please select shelter");
      setdialog((prev) => {
        return {
          ...prev,
          validation: {
            key: "shelter",
            idValid: false,
            errorMsg: "Please select shelter",
          },
        };
      });
    } else if (
      dialog.data.bed === null &&
      dialog.data.prevstatus === "Approved"
    ) {
      // props.toastFunc("error", "Error", "Please select bed");
      setdialog((prev) => {
        return {
          ...prev,
          validation: {
            key: "bed",
            idValid: false,
            errorMsg: "Please select bed",
          },
        };
      });
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
            width: 25,
            height: 25,
            borderRadius: "50%",
            objectFit: "fill",
          }}
        />
        <OnTextRender text={data.requestedby} isBold={false} />
      </div>
    );
  };
  const getDateDifferenceIfStartIsGreater = (
    sDateStr: string,
    eDateStr: string
  ) => {
    const sDate = new Date(sDateStr);
    const eDate = new Date(eDateStr);

    // Normalize both to just the date (remove time)
    sDate.setHours(0, 0, 0, 0);
    eDate.setHours(0, 0, 0, 0);

    const diffTime = eDate.getTime() - sDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "0days";
    return `${Math.round(diffDays)}days`;
  };

  //Status Color
  const statusTemplate = (data: any) => {
    let _stsObj: any = {
      borderColor: "",
      bgColor: "",
      color: "",
    };
    if (
      data.prevstatus === "Rejected by Billing Team" ||
      data.prevstatus === "Rejected by COA" ||
      data.status === "Rejected"
    ) {
      _stsObj = {
        borderColor: "#f77575",
        bgColor: "#f7e6e6",
        color: "#d32929",
      };
    } else if (
      data.prevstatus === "Approved" ||
      data.status === "Approved" ||
      data.status === "Submitted" ||
      data.status === "Bed Assigned"
    ) {
      _stsObj = {
        borderColor: "#AED9AA",
        bgColor: "#F8FFF8",
        color: "#1A8812",
      };
    } else if (data.prevstatus === "Closed" || data.status === "Closed") {
      _stsObj = {
        borderColor: "#FFBF00",
        bgColor: "#ffbf001a",
        color: "#a78110",
      };
    } else if (data.prevstatus === "Occupied") {
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
        {data.prevstatus === "Rejected by Billing Team" ||
        data.prevstatus === "Rejected by COA" ||
        data.status === "Rejected" ? (
          <i className="pi pi-times-circle" />
        ) : data.prevstatus === "Approved" || data.status === "Approved" ? (
          <i className="pi pi-check-circle" />
        ) : data.prevstatus === "Closed" ? (
          <i className="pi pi-lock" />
        ) : data.prevstatus === "Occupied" ? (
          <i className="pi pi-users" />
        ) : (
          <i className="pi pi-check" />
        )}
        {data.prevstatus === "Approved"
          ? "Ready to Assign"
          : data.prevstatus || data.status}
      </div>
    );
  };
  //Action template
  const actionTemplate = (item: any) => {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {(props.CurrentRole === "Supervisor" &&
          item.requestedemail !== props.CurrentUser) ||
        (item.status !== "Submitted by Supervisor" &&
          props.CurrentRole === "Billing Team") ||
        (item.status !== "Approved by Billing Team" &&
          props.CurrentRole === "Chief of Approval") ? (
          <Tooltip title="View">
            <VisibilityIcon
              onClick={() =>
                setdialog({ condition: true, data: item, type: "view" })
              }
              sx={{
                cursor: "pointer",
                backgroundColor: "#e3f2fd",
                padding: "4px",
                borderRadius: "6px",
                fontSize: "24px",
                "&:hover": {
                  backgroundColor: "#bbdefb",
                },
              }}
            />
          </Tooltip>
        ) : (
          props.CurrentRole === "Supervisor" &&
          item.requestedemail === props.CurrentUser &&
          item.status !== "Submitted by Supervisor" &&
          item.status !== "Rejected by Billing Team" &&
          item.status !== "Rejected by COA" &&
          item.status !== "Approved" &&
          item.status !== "Occupied" && (
            <Tooltip title="View">
              <VisibilityIcon
                onClick={() =>
                  setdialog({ condition: true, data: item, type: "view" })
                }
                sx={{
                  cursor: "pointer",
                  backgroundColor: "#e3f2fd",
                  padding: "4px",
                  borderRadius: "6px",
                  fontSize: "24px",
                  "&:hover": {
                    backgroundColor: "#bbdefb",
                  },
                }}
              />
            </Tooltip>
          )
        )}
        {props.CurrentRole === "Supervisor" ? (
          <>
            {(item.nextlevel === 0 ||
              item.nextlevel === 2 ||
              item.prevstatus === "Approved" ||
              item.prevstatus === "Occupied") &&
              props.CurrentRole === "Supervisor" &&
              item.requestedemail === props.CurrentUser && (
                <Tooltip
                  title={`${
                    item.prevstatus === "Approved" ? "Assign Bed" : "Edit"
                  }`}
                >
                  {item.prevstatus === "Approved" ? (
                    <TaskIcon
                      onClick={() => {
                        if (item.bed) {
                          const _dropdown = { ...drpdowns };
                          _dropdown.bed = [];
                          const _bedDropDown: any[] = [...masterBedData].filter(
                            (e: any) => e.id === item.bed
                          );
                          for (const data of _bedDropDown) {
                            _dropdown.bed.push({
                              code: data.id,
                              name: data.bed,
                            });
                          }
                          setdrpdowns({ ..._dropdown });
                        }
                        if (item.prevstatus === "Occupied") {
                          const _dropdown = { ...drpdowns };
                          _dropdown.status = [
                            { code: item.prevstatus, name: item.prevstatus },
                            { code: "Closed", name: "Closed" },
                          ];
                          const ShelterDrpDown: any = masterBedData.find(
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
                          const _dropdown = { ...drpdowns };
                          _dropdown.shelter = [];
                          const ShelterDrpDown: any = masterBedData.filter(
                            (e) => e.status === "Available"
                          );
                          const addedShelterIds = new Set();

                          if (ShelterDrpDown.length > 0) {
                            for (const data of ShelterDrpDown) {
                              const shelterCode = data.shelterid;
                              const shelterName = data.sheltername;
                              if (!addedShelterIds.has(shelterCode)) {
                                _dropdown.shelter.push({
                                  code: shelterCode,
                                  name: shelterName,
                                });
                                addedShelterIds.add(shelterCode);
                              }
                            }
                            setdrpdowns({ ..._dropdown });
                          }
                        }

                        setdialog({
                          condition: true,
                          data: item,
                          type: "edit",
                        });
                      }}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: "#e7f0e7de",
                        padding: "4px",
                        borderRadius: "6px",
                        fontSize: "24px",
                        color: "##b99223",
                        "&:hover": {
                          backgroundColor: "#cbfbbbc2",
                        },
                      }}
                    />
                  ) : (
                    <EditIcon
                      onClick={() => {
                        if (item.bed) {
                          const _dropdown = { ...drpdowns };
                          _dropdown.bed = [];
                          const _bedDropDown: any[] = [...masterBedData].filter(
                            (e: any) => e.id === item.bed
                          );
                          for (const data of _bedDropDown) {
                            _dropdown.bed.push({
                              code: data.id,
                              name: data.bed,
                            });
                          }
                          setdrpdowns({ ..._dropdown });
                        }
                        if (item.prevstatus === "Occupied") {
                          const _dropdown = { ...drpdowns };
                          _dropdown.bed = [];
                          _dropdown.status = [
                            { code: item.prevstatus, name: item.prevstatus },
                            { code: "Closed", name: "Closed" },
                          ];
                          const ShelterDrpDown: any = masterBedData.find(
                            (e) => e.shelterid === item.shelter
                          );
                          const _bedDropDown: any[] = [...masterBedData].filter(
                            (e: any) => e.id === item.bed
                          );
                          for (const data of _bedDropDown) {
                            _dropdown.bed.push({
                              code: data.id,
                              name: data.bed,
                            });
                          }
                          _dropdown.shelter = [
                            {
                              code: item.shelter,
                              name: ShelterDrpDown.sheltername,
                            },
                          ];
                          setdrpdowns({ ..._dropdown });
                        } else if (item.prevstatus === "Approved") {
                          const _dropdown = { ...drpdowns };

                          const ShelterDrpDown: any = masterBedData.filter(
                            (e) => e.status === "Available"
                          );
                          const addedShelterIds = new Set();

                          if (ShelterDrpDown.length > 0) {
                            for (const data of ShelterDrpDown) {
                              const shelterCode = data.shelterid;
                              const shelterName = data.sheltername;
                              if (!addedShelterIds.has(shelterCode)) {
                                _dropdown.shelter.push({
                                  code: shelterCode,
                                  name: shelterName,
                                });
                                addedShelterIds.add(shelterCode);
                              }
                            }
                            setdrpdowns({ ..._dropdown });
                          }
                        }

                        setdialog({
                          condition: true,
                          data: item,
                          type: "edit",
                        });
                      }}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: "#e3f2fd",
                        padding: "4px",
                        borderRadius: "6px",
                        fontSize: "24px",
                        "&:hover": {
                          backgroundColor: "#bbdefb",
                        },
                      }}
                    />
                  )}
                </Tooltip>
              )}
          </>
        ) : item.nextlevel === 3 &&
          props.CurrentRole === "Chief of Approval" ? (
          <>
            <Tooltip title="Approval Request">
              <TaskIcon
                onClick={() =>
                  setdialog({ condition: true, data: item, type: "view" })
                }
                sx={{
                  cursor: "pointer",
                  backgroundColor: "#e7f0e7de",
                  padding: "4px",
                  borderRadius: "6px",
                  fontSize: "24px",
                  color: "#b99223",
                  "&:hover": {
                    backgroundColor: "#cbfbbbc2",
                  },
                }}
              />
            </Tooltip>
          </>
        ) : item.nextlevel === 2 && props.CurrentRole === "Billing Team" ? (
          <>
            <Tooltip title="Approval Request">
              <TaskIcon
                onClick={() =>
                  setdialog({ condition: true, data: item, type: "view" })
                }
                sx={{
                  cursor: "pointer",
                  backgroundColor: "#e7f0e7de",
                  padding: "4px",
                  borderRadius: "6px",
                  fontSize: "24px",
                  color: "#b99223",
                  "&:hover": {
                    backgroundColor: "#cbfbbbc2",
                  },
                }}
              />
            </Tooltip>
          </>
        ) : null}
        <Tooltip title="Log">
          <ScheduleIcon
            onClick={(e) => {
              e.stopPropagation();
              setdialog({
                condition: true,
                data: item,
                type: "workflow",
              });
            }}
            sx={{
              cursor: "pointer",
              backgroundColor: "#e3f2fd",
              padding: "4px",
              borderRadius: "6px",
              fontSize: "24px",
              "&:hover": {
                backgroundColor: "#bbdefb",
              },
            }}
          />
        </Tooltip>
        {item.requestedemail === props.CurrentUser &&
          (item.status === "Submitted by Supervisor" ||
            item.status === "Rejected by Billing Team" ||
            item.status === "Rejected by COA") && (
            <Tooltip title="Delete">
              <DeleteIcon
                onClick={() => {
                  setdialog({
                    condition: true,
                    data: item,
                    type: "delete",
                  });
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
          )}
      </div>
    );
  };
  //filter function
  const filterFunc = (key: string, value: any): void => {
    const _filterkeys: any = { ...filterkeys };
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
    if (_filterkeys.search.trim() !== "") {
      _filterdata = _filterdata.filter((_d: IData) => {
        const _searchValue: string = value.toLowerCase();
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
    fetchBedRequest(
      drpdowns,
      setdrpdowns,
      setmasterData,
      setfilterData,
      setloader
    );
    fetchBedslogs(setmasterBedLogData);
    fetchBedsDetails(setmasterBedData);
  }, []);

  const getFileIcon = (name: string) => {
    const extension = name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <img src={pdfIcon} alt="pdf-icon" width={15} height={15} />;
      case "doc":
      case "docx":
        return <img src={docIcon} alt="word-icon" width={15} height={15} />;
      case "xls":
      case "xlsx":
        return <img src={xlsIcon} alt="excel-icon" width={15} height={15} />;
      case "png":
      case "jpg":
      case "jpeg":
        return <img src={imageIcon} alt="image-icon" width={15} height={15} />;
      case "txt":
        return <img src={txtIcon} alt="text-icon" width={15} height={15} />;
      default:
        return (
          <img src={documentIcon} alt="file-icon" width={15} height={15} />
        );
    }
  };

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className={styles.maincontainer}>
          <div>
            <div className={styles.bannerSection}>
              <div className={styles.logoSection}>
                <img src={logo} alt="logo" />
                <h2 className={styles.heading}>Mysti's Shelter Management</h2>
              </div>
            </div>
            <section className={styles.headingSection}>
              <div className={styles.heading} />
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
                        gap: "10px",
                      }}
                    >
                      <Dropdown
                        style={{ width: "250px" }}
                        value={filterkeys.client}
                        onChange={(e) => filterFunc("client", e.value)}
                        options={drpdowns.filterclient}
                        optionLabel="name"
                        placeholder="Select a client"
                      />
                      <Dropdown
                        style={{ width: "250px" }}
                        value={filterkeys.status}
                        onChange={(e) => filterFunc("status", e.value)}
                        options={drpdowns.filterstatus}
                        optionLabel="name"
                        placeholder="Select a status"
                      />
                      <IconField iconPosition="left" style={{ width: "250px" }}>
                        <InputIcon
                          className="pi pi-search"
                          style={{
                            padding: "0px 5px",
                            fontSize: "16px",
                          }}
                        />
                        <InputText
                          style={{ width: "100%" }}
                          placeholder="Search"
                          onChange={(e) => filterFunc("search", e.target.value)}
                          value={filterkeys.search}
                        />
                      </IconField>
                      <Tooltip title="Reset Filter">
                        <RestartAltIcon
                          onClick={() => {
                            setfilterData([...masterData]);
                            setfilterkeys({ ..._fkeys });
                          }}
                          sx={{
                            cursor: "pointer",
                            backgroundColor: "#e7f0e7de",
                            padding: "4px",
                            borderRadius: "6px",
                            fontSize: "34px",
                            color: "#b99223",
                            "&:hover": {
                              backgroundColor: "#cbfbbbc2",
                            },
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {props.CurrentRole === "Supervisor" && (
                    <CustomButton
                      btnType="primaryBtn"
                      text="New Request"
                      icon="pi pi-plus"
                      onClick={() =>
                        setdialog({
                          ..._dialog,
                          data: { ...requestDetails },
                          condition: true,
                          type: "add",
                        })
                      }
                    />
                  )}
                  <Tooltip title="Shelter Configuration">
                    <Button
                      className={styles.configBtn}
                      label=""
                      icon="pi pi-cog"
                      onClick={() => {
                        props.setconfigpage(true);
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            </section>
          </div>
          {/* table */}
          {/* <div className={styles.dataTable}> */}
          <div className="custom-data-table">
            <DataTable
              value={filterData}
              className="min_height_69vh"
              scrollable
              scrollHeight="60vh"
              style={{ minWidth: "100%" }}
              key={0}
              paginator={filterData.length > 0}
              rows={9}
              paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} ${
                filterData?.length === 1 ? "record" : "records"
              }`}
              emptyMessage={() => {
                return loader ? (
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#f7f8fa",
                      height: "30vh",
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
                field="requestId"
                header="Request Id"
                style={{ width: "10%" }}
                body={(rowData) => (
                  <OnTextRender
                    text={`MSH-${rowData.id.toString().padStart(4, "0")}`}
                    isBold={true}
                  />
                )}
              />
              <Column
                field=""
                header="Requested By"
                body={requestorTemplate}
                style={{ width: "14%" }}
              />
              <Column
                field="date"
                header="Date of Request"
                style={{ width: "12%" }}
                body={(rowData) => (
                  <OnTextRender text={rowData.dateofrequest} isBold={false} />
                )}
              />
              <Column
                field="bedoccupiedon"
                header="Bed Occupied On"
                style={{ width: "12%" }}
                body={(rowData) => (
                  <OnTextRender
                    text={
                      rowData.bedoccupiedon
                        ? moment(rowData.bedoccupiedon).format("DD/MM/YYYY")
                        : "-"
                    }
                    isBold={false}
                  />
                )}
              />
              <Column
                field="bedoccupiedon"
                header="Occupied Days"
                style={{ width: "12%" }}
                body={(rowData) => (
                  <OnTextRender
                    text={
                      rowData.bedoccupiedon
                        ? getDateDifferenceIfStartIsGreater(
                            rowData.bedoccupiedon,
                            new Date().toISOString()
                          )
                        : "-"
                    }
                    isBold={true}
                  />
                )}
              />
              <Column
                field="client"
                header="Client"
                style={{ width: "13%" }}
                body={(rowData) => (
                  <OnTextRender text={rowData.client} isBold={false} />
                )}
              />
              <Column
                field="status"
                header="Status"
                body={statusTemplate}
                style={{
                  width: "17%",
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
                  <label className="input-label">
                    Client Name {dialog.type === "view" ? "" : asterisk()}
                  </label>
                  <InputText
                    placeholder="Enter here"
                    value={dialog.data.client}
                    onChange={(e) => onChangeHandler("client", e.target.value)}
                    readOnly={
                      dialog.type === "view" ||
                      dialog.data.prevstatus === "Approved" ||
                      dialog.data.prevstatus === "Occupied"
                        ? true
                        : false
                    }
                    invalid={
                      dialog?.validation?.key === "client" &&
                      !dialog?.validation?.idValid
                    }
                  />
                </div>

                <div className={styles.fieldssm}>
                  <label className="input-label">
                    Client Email {dialog.type === "view" ? "" : asterisk()}
                  </label>
                  <InputText
                    placeholder="Enter here"
                    value={dialog.data.clientemail}
                    onChange={(e) =>
                      onChangeHandler("clientemail", e.target.value)
                    }
                    readOnly={
                      dialog.type === "view" ||
                      dialog.data.prevstatus === "Approved" ||
                      dialog.data.prevstatus === "Occupied"
                        ? true
                        : false
                    }
                    invalid={
                      dialog?.validation?.key === "clientemail" &&
                      !dialog?.validation?.idValid
                    }
                  />
                </div>
                <div className={styles.fieldssm}>
                  <label className="input-label">
                    Bed Needed On {dialog.type === "view" ? "" : asterisk()}
                  </label>
                  <Calendar
                    value={dialog.data.bedneededon}
                    onChange={(e) => onChangeHandler("bedneededon", e.value)}
                    placeholder="Select start date"
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="FormCalender"
                    minDate={new Date()}
                    disabled={
                      dialog.type === "view" ||
                      dialog.data.prevstatus === "Approved" ||
                      dialog.data.prevstatus === "Occupied"
                        ? true
                        : false
                    }
                    invalid={
                      dialog?.validation?.key === "bedneededon" &&
                      !dialog?.validation?.idValid
                    }
                  />
                </div>
              </div>
              <div className={styles.modalBodyFlexCmtsFile}>
                <div className={styles.fieldssm} style={{ width: "100%" }}>
                  <label className="input-label">Comments</label>
                  <InputTextarea
                    rows={4}
                    placeholder="Enter here"
                    style={{ resize: "none", height: "100px" }}
                    onChange={(e) =>
                      onChangeHandler("comments", e.target.value)
                    }
                    value={dialog.data.comments}
                    readOnly={
                      dialog.type === "view" ||
                      dialog.data.prevstatus === "Approved" ||
                      dialog.data.prevstatus === "Occupied"
                        ? true
                        : false
                    }
                  />
                </div>
              </div>
              <div className={styles.fieldssm} style={{ width: "100%" }}>
                <div style={{ marginBottom: "5px" }}>
                  {dialog.type !== "view" &&
                  dialog.data.prevstatus !== "Approved" &&
                  dialog.data.prevstatus !== "Occupied" ? (
                    <div
                      style={{
                        padding: "10px 0px",
                      }}
                    >
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
                    <label className="input-label">Attachments</label>
                  )}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                    maxHeight: "95px",
                    overflowY: "auto",
                    padding: "10px",
                    borderRadius: 5,
                    backgroundColor: "#f8f5efd1",
                    border: "1px solid #ede5e5",
                  }}
                >
                  {dialog.data.files.length > 0 ? (
                    dialog.data.files
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
                              {getFileIcon(e.name)}
                              <span className={styles.fileText}>{e.name}</span>
                            </div>
                          ) : (
                            <div className={styles.fileName}>
                              {getFileIcon(e.name)}
                              <span className={styles.fileText}>{e.name}</span>
                            </div>
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {dialog.type !== "view" &&
                            dialog.data.prevstatus !== "Approved" ? (
                              <i
                                className="pi pi-times"
                                style={{
                                  color: "red",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                                onClick={() => handleDelete(index)}
                              />
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ fontSize: "13px" }}>No attachments found</div>
                  )}
                </div>
              </div>
              {(dialog.data.nextlevel === 2 || dialog.data.nextlevel === 3) &&
              props.CurrentRole !== "Supervisor" ? (
                <div className={styles.fieldssm} style={{ width: "100%" }}>
                  <label className="input-label">Approver Comments</label>
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
                    gap: "30px",
                    justifyContent: "space-between",
                  }}
                >
                  <div className={styles.fieldssm}>
                    <label className="input-label">
                      Bed Occupied On{" "}
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
                      invalid={
                        dialog?.validation?.key === "bedoccupiedon" &&
                        !dialog?.validation?.idValid
                      }
                      minDate={
                        dialog.data.bedneededon
                          ? new Date(dialog.data.bedneededon)
                          : new Date()
                      }
                    />
                  </div>
                  <div className={styles.fieldssm}>
                    <label className="input-label">
                      Shelter{" "}
                      {dialog.data.prevstatus === "Occupied" ? "" : asterisk()}
                    </label>
                    <Dropdown
                      value={dialog.data.shelter || ""}
                      onChange={(e) => onChangeHandler("shelter", e.value)}
                      options={drpdowns.shelter}
                      optionLabel="name"
                      optionValue="code"
                      placeholder="Select a shelter"
                      readOnly={
                        dialog.data.prevstatus === "Occupied" ? true : false
                      }
                      invalid={
                        dialog?.validation?.key === "shelter" &&
                        !dialog?.validation?.idValid
                      }
                    />
                  </div>
                  <div className={styles.fieldssm}>
                    <label className="input-label">
                      Bed{" "}
                      {dialog.data.prevstatus === "Occupied" ? "" : asterisk()}
                    </label>
                    <Dropdown
                      value={dialog.data.bed}
                      onChange={(e) => onChangeHandler("bed", e.value)}
                      options={drpdowns.bed}
                      optionLabel="name"
                      optionValue="code"
                      placeholder="Select a bed"
                      readOnly={
                        dialog.data.prevstatus === "Occupied" ? true : false
                      }
                      invalid={
                        dialog?.validation?.key === "bed" &&
                        !dialog?.validation?.idValid
                      }
                    />
                  </div>
                </div>
              ) : (
                ""
              )}
              {dialog.data.prevstatus === "Occupied" &&
                props.CurrentRole === "Supervisor" && (
                  <div className={styles.fieldssm} style={{ width: "31%" }}>
                    <label className="input-label">Status {asterisk()}</label>
                    <Dropdown
                      value={dialog.data.status}
                      onChange={(e) => onChangeHandler("status", e.value)}
                      options={drpdowns.status}
                      optionLabel="name"
                      optionValue="code"
                      placeholder="Select a status"
                      disabled={dialog.type === "edit" ? false : true}
                      invalid={
                        dialog?.validation?.key === "status" &&
                        !dialog?.validation?.idValid
                      }
                    />
                  </div>
                )}
              <div className={styles.modalFooter}>
                <CustomButton
                  btnType="cancelBtn"
                  text={dialog.type === "view" ? "Close" : "Cancel"}
                  // icon="pi pi-times-circle"
                  onClick={() => setdialog({ ..._dialog })}
                />
                <div
                  style={{ display: "flex", gap: "15px", alignItems: "center" }}
                >
                  {!dialog?.validation?.idValid && (
                    <div style={{ fontSize: "13px", color: "red" }}>
                      {dialog?.validation?.errorMsg}
                    </div>
                  )}
                  {dialog.type !== "view" ? (
                    <CustomButton
                      btnType="primaryBtn"
                      text={dialog.type === "add" ? "Save" : "Update"}
                      // icon="pi pi-check-circle"
                      onClick={() => requestValidation("Submit")}
                    />
                  ) : (dialog.data.nextlevel === 2 ||
                      dialog.data.nextlevel === 3) &&
                    props.CurrentRole !== "Supervisor" ? (
                    <>
                      <CustomButton
                        btnType="rejectBtn"
                        text="Rejected"
                        // icon="pi pi-undo"
                        onClick={() => requestValidation("Rejected")}
                      />
                      <CustomButton
                        btnType="approvebtn"
                        text="Approved"
                        // icon="pi pi-verified"
                        onClick={() => requestValidation("Approved")}
                      />
                    </>
                  ) : null}
                </div>
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
                <CustomButton
                  btnType="cancelBtn"
                  text="No"
                  // icon="pi pi-times-circle"
                  onClick={() => setdialog({ ..._dialog })}
                />
                <CustomButton
                  btnType="primaryBtn"
                  text="Yes"
                  // icon="pi pi-trash"
                  onClick={() => {
                    updateRequest(dialog.data, true);
                  }}
                />
              </div>
            </Dialog>
          ) : dialog.type === "workflow" ? (
            <Dialog
              header="Approval Workflow"
              visible={dialog.condition}
              style={{ width: "70%" }}
              className="workflowPopup requestlog-Design"
              onHide={(): void => setdialog({ ..._dialog })}
              draggable={false}
            >
              <div className="custom-data-table">
                <DataTable
                  value={dialog.data.requestlog}
                  className="min_height_55vh"
                  scrollable
                  scrollHeight="55vh"
                  style={{ minWidth: "100%" }}
                  key={0}
                  paginator={dialog.data.requestlog?.length > 10}
                  rows={9}
                  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                  currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} ${
                    dialog.data.requestlog?.length === 1 ? "record" : "records"
                  }`}
                  emptyMessage={() => {
                    return loader ? (
                      <div
                        style={{
                          width: "100%",
                          backgroundColor: "#f7f8fa",
                          height: "30vh",
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
                    field="role"
                    header="Role"
                    style={{ width: "25%" }}
                    body={(rowData) => (
                      <OnTextRender text={rowData.role} isBold={true} />
                    )}
                  />
                  <Column
                    field="username"
                    header="Name"
                    style={{ width: "25%" }}
                    body={(rowData) => (
                      <OnTextRender text={rowData.username} isBold={false} />
                    )}
                  />
                  <Column
                    field="status"
                    header="Status"
                    body={statusTemplate}
                    style={{
                      width: "17%",
                    }}
                  />
                  <Column
                    field="status"
                    header="Comments"
                    style={{ width: "25%" }}
                    body={(rowData) => (
                      <OnTextRender
                        text={rowData.comments ? rowData.comments : "-"}
                        isBold={false}
                      />
                    )}
                  />
                </DataTable>
              </div>

              <div className={styles.modalFooter}>
                <CustomButton
                  btnType="cancelBtn"
                  text="Close"
                  // icon="pi pi-times-circle"
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
