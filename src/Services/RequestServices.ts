/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */

import * as moment from "moment";
import { SPLists } from "../Config/Config";
import SpServices from "./SPServices/SpServices";

export const fetchRequestLogs = async () => {
  try {
    const requestLogResponse = await SpServices.SPReadItems({
      Listname: SPLists.RequestLogList,
      Select: "*,User/Id,User/Title,User/EMail",
      Expand: "User",
      Orderby: "ID",
      Orderbydecorasc: false,
    });
    const tempRequestLogs = requestLogResponse.map((data) => {
      return {
        id: data?.Id,
        requestId: data?.RequestIdId,
        status: data?.Status,
        role: data?.Role,
        userid: data?.User?.Id,
        username: data?.User?.Title,
        comments: data?.Comments,
      };
    });
    return tempRequestLogs;
  } catch (err) {
    console.log("Error : ", err);
    return [];
  }
};

export const fetchBedsDetails = async (setmasterBedData: any) => {
  try {
    const bedsResponse = await SpServices.SPReadItems({
      Listname: SPLists.BedConfigList,
      Select: "*,Shelter/Id,Shelter/Title",
      Expand: "Shelter",
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "ne",
          FilterValue: 1,
        },
      ],
      Orderby: "ID",
      Orderbydecorasc: false,
    });
    const tempBedsDetails = bedsResponse?.map((data) => {
      return {
        id: data.Id,
        bed: data.Title,
        shelterid: data.Shelter.Id,
        sheltername: data.Shelter.Title,
        status: data.AvailabilityStatus,
      };
    });
    setmasterBedData([...tempBedsDetails]);
  } catch (err) {
    console.log("Error : ", err);
  }
};
export const fetchBedslogs = async (setmasterBedLogData: any) => {
  try {
    const bedlogsResponse = await SpServices.SPReadItems({
      Listname: SPLists.BedLogList,
      Select: "*,Shelter/Id,Shelter/Title,Bed/Id,Bed/Title",
      Expand: "Shelter,Bed",
      Orderby: "ID",
      Orderbydecorasc: false,
    });
    const tempBedslogs = bedlogsResponse?.map((data) => {
      return {
        id: data.Id,
        bed: data.Bed.Id,
        shelterid: data.Shelter.ID,
        sheltername: data.Shelter.Title,
        status: data.AvailabilityStatus,
      };
    });
    setmasterBedLogData([...tempBedslogs]);
  } catch (err) {
    console.log("Error : ", err);
  }
};

export const fetchBedRequest = async (
  dropdown: any,
  setdrpdowns: any,
  setmasterData: any,
  setfilterData: any,
  setloader: any
) => {
  try {
    const _dropdown: any = { ...dropdown };
    const requestLogs: any[] = (await fetchRequestLogs()) || [];
    const requestResponse = await SpServices.SPReadItems({
      Listname: SPLists.RequestList,
      Select:
        "*,RequestedBy/Id,RequestedBy/Title,RequestedBy/EMail,AttachmentFiles,Bed/Id,Bed/Title,Shelter/Id,Shelter/Title",
      Expand: "RequestedBy,AttachmentFiles,Bed,Shelter",
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "ne",
          FilterValue: 1,
        },
      ],
      Orderby: "ID",
      Orderbydecorasc: false,
    });
    const bedRequestDetailsPromises = requestResponse?.map(async (data) => {
      const arrAttach: any[] = await data?.AttachmentFiles?.map((val: any) => {
        return {
          etag: "",
          name: val?.FileName,
          url: val?.ServerRelativeUrl,
          blop: val?.ServerRelativeUrl,
          type: "Inlist",
        };
      });
      const requestlogdata: any = requestLogs?.filter(
        (e: any) => e.requestId === data.Id
      );
      _dropdown.filterclient.push({
        code: data.Id,
        name: data.Client,
      });
      if (
        !_dropdown.filterstatus.some((item: any) => item.name === data.Status)
      ) {
        _dropdown.filterstatus.push({
          code: data.Id,
          name: data.Status,
        });
      }
      return {
        id: data.Id,
        requestedby: data?.RequestedBy?.Title,
        requestedemail: data?.RequestedBy?.EMail,
        bedoccupiedon: data.BedOccupiedOn ? new Date(data.BedOccupiedOn) : null,
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
      };
    });
    const bedRequestDetails = await Promise.all(bedRequestDetailsPromises);
    setmasterData([...bedRequestDetails]);
    setfilterData([...bedRequestDetails]);
    setdrpdowns(_dropdown);
    setloader(false);
  } catch (err) {
    console.log("Error : ", err);
  }
};
