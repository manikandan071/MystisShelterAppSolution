/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */

import { SPLists } from "../Config/Config";
import SpServices from "./SPServices/SpServices";

export const fetchShelterDetailsMaster = async (
  setMasterState: any,
  setTempState: any,
  isLoader: any
) => {
  try {
    isLoader(true);
    const shelterListResponse = await SpServices.SPReadItems({
      Listname: SPLists.ShelterConfigList,
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "ne",
          FilterValue: 1,
        },
      ],
    });
    const tempBedDetails = shelterListResponse
      ?.map((shelter: any) => {
        const shelterId = shelter?.ID;
        return {
          Id: shelterId,
          ShelterName: shelter?.Title,
          Descriptions: shelter?.Description,
        };
      })
      .sort((a, b) => b.Id - a.Id);
    setMasterState([...tempBedDetails]);
    setTempState([...tempBedDetails]);
    isLoader(false);
  } catch (err) {
    console.log("Error : ", err);
  }
};
export const fetchShelterDetails = async (setSheltersList: any) => {
  try {
    const shelterListResponse = await SpServices.SPReadItems({
      Listname: SPLists.ShelterConfigList,
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "ne",
          FilterValue: 1,
        },
      ],
    });
    const tempBedDetails = shelterListResponse?.map((shelter: any) => {
      const shelterId = shelter?.ID;
      return {
        Id: shelterId,
        name: shelter?.Title,
      };
    });
    setSheltersList([...tempBedDetails]);
  } catch (err) {
    console.log("Error : ", err);
  }
};
export const fetchBedLogDetails = async (
  bedId: number,
  setBedLogsList: any,
  setIsUpdateDetails: any
) => {
  try {
    setIsUpdateDetails((prev: any) => {
      return {
        ...prev,
        isLoading: true,
      };
    });
    const bedLogsListResponse = await SpServices.SPReadItems({
      Listname: SPLists.BedLogList,
      Select: "*,Bed/Id,Bed/Title,Shelter/Id,Shelter/Title",
      Expand: "Bed,Shelter",
      Filter: [
        {
          FilterKey: "BedId",
          Operator: "eq",
          FilterValue: bedId,
        },
      ],
    });
    const tempBedLogDetails = bedLogsListResponse?.map((log: any) => {
      const logId = log?.ID;
      return {
        Id: logId,
        BedName: log?.Bed?.Title,
        ShelterName: log?.Shelter?.Title,
        ShelterId: log?.Shelter?.Id,
        BedStatus: log?.AvailabilityStatus,
        ClientName: log?.Client || "-",
        BookedStartDate: log?.BedOccupiedOn || "-",
        BookedEndDate: log?.BedClosedOn || "-",
      };
    });
    setBedLogsList([...tempBedLogDetails]);
    setIsUpdateDetails((prev: any) => {
      return {
        ...prev,
        isLoading: false,
      };
    });
  } catch (err) {
    console.log("Error : ", err);
  }
};

export const fetchBedDetails = async (
  setMasterBedslist: any,
  setTempBedsList: any,
  setIsLoader: any
) => {
  try {
    setIsLoader(true);
    // 1. Fetch beds
    const bedListResponse = await SpServices.SPReadItems({
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
    });

    // 2. Fetch requests
    const requestListResponse: any = await SpServices.SPReadItems({
      Listname: SPLists.RequestList,
      Select: "*,Shelter/Id,Bed/Id",
      Expand: "Shelter,Bed",
    });

    // 3. Build detailed bed list
    const tempBedDetails = bedListResponse
      ?.map((bed: any) => {
        const bedId = bed?.ID;
        const shelterId = bed?.Shelter?.Id;

        // 4. Find matching request by bed + shelter
        const matchingRequest = requestListResponse?.find((req: any) => {
          return req?.Bed?.Id === bedId && req?.Shelter?.Id === shelterId;
        });

        return {
          Id: bedId,
          BedName: bed?.Title,
          BedStatus: bed?.AvailabilityStatus,
          ShelterName: bed?.Shelter?.Title,
          ShelterId: bed?.Shelter?.Id,
          ClientName: bed?.Client || "-",
          BookedDate: bed?.BedOccupiedOn || "-",
          RequestStatus: matchingRequest?.Status || "-",
          Description: bed?.Description || "-",
        };
      })
      .sort((a, b) => b.Id - a.Id);

    setMasterBedslist(tempBedDetails);
    setTempBedsList(tempBedDetails);
    setIsLoader(false);
  } catch (err) {
    console.error("Error fetching bed/request details:", err);
  }
};

export const submitBedsDetails = async (
  formDetails: any,
  setTempBedsList: any,
  handleClosePopup: any,
  index: number
) => {
  try {
    const tempArray: any[] = [];

    // ✅ Create array of promises for SPAddItem
    const bedInsertPromises = formDetails?.Beds?.value?.map(
      async (bedDetails: any) => {
        const spPayload = {
          Title: bedDetails?.BedName?.value,
          ShelterId: formDetails?.ShelterName?.value?.Id,
          Description: bedDetails?.BedDescription?.value,
        };

        const res = await SpServices.SPAddItem({
          Listname: SPLists.BedConfigList,
          RequestJSON: spPayload,
        });

        tempArray.push({
          BedName: spPayload?.Title,
          BedStatus: "Available",
          BookedDate: "-",
          ClientName: "-",
          Id: res?.data?.ID,
          RequestStatus: "",
          ShelterName: formDetails?.ShelterName?.value?.name,
          Description: spPayload?.Description,
          ShelterId: spPayload?.ShelterId,
        });
      }
    );

    // ✅ Wait for all SPAddItem calls to finish
    await Promise.all(bedInsertPromises);

    // ✅ Now update UI
    setTempBedsList((prev: any) =>
      [...tempArray, ...prev].sort((a, b) => b.Id - a.Id)
    );
    handleClosePopup(index); // ✅ now runs AFTER SharePoint updates
  } catch (err) {
    console.error("Error:", err);
  }
};
export const updateBedsDetails = async (
  formDetails: any,
  deletedBedsList: any[],
  setMasterState: any,
  setTempBedsList: any,
  setIsUpdateDetails: any,
  handleClosePopup: any,
  index: number
) => {
  try {
    // const newBedsArray: any[] = [];

    const shelterId = formDetails?.ShelterName?.value?.Id;
    const shelterName = formDetails?.ShelterName?.value?.name;

    // ✅ Process Create & Update together
    const bedPromises = formDetails?.Beds?.value?.map(
      async (bedDetails: any) => {
        const spPayload = {
          Title: bedDetails?.BedName?.value,
          ShelterId: shelterId,
          Description: bedDetails?.BedDescription?.value,
        };

        if (bedDetails?.BedName?.Id) {
          // ✅ Update existing bed
          const updated = await SpServices.SPUpdateItem({
            Listname: SPLists.BedConfigList,
            ID: bedDetails?.BedName?.Id,
            RequestJSON: spPayload,
          });
          console.log("updated", updated);

          return {
            type: "update",
            data: {
              Id: bedDetails?.BedName?.Id,
              BedName: spPayload.Title,
              Description: spPayload.Description,
              ShelterId: shelterId,
              ShelterName: shelterName,
            },
          };
        } else {
          // ✅ Create new bed
          const res = await SpServices.SPAddItem({
            Listname: SPLists.BedConfigList,
            RequestJSON: spPayload,
          });

          return {
            type: "add",
            data: {
              Id: res?.data?.ID,
              BedName: spPayload.Title,
              BedStatus: "Available",
              BookedDate: "-",
              ClientName: "-",
              RequestStatus: "",
              Description: spPayload.Description,
              ShelterId: shelterId,
              ShelterName: shelterName,
            },
          };
        }
      }
    );

    // ✅ Process deletions
    const deletePromises = deletedBedsList.map(async (bedId) => {
      await SpServices.SPUpdateItem({
        Listname: SPLists.BedConfigList,
        ID: bedId,
        RequestJSON: { IsDelete: true },
      });

      return { type: "delete", id: bedId };
    });

    // ✅ Await all SharePoint calls
    const allResponses = await Promise.all([...bedPromises, ...deletePromises]);

    // ✅ Prepare new temp list
    setTempBedsList((prev: any) => {
      let updatedList = [...prev];

      allResponses.forEach((response: any) => {
        if (response?.type === "update") {
          updatedList = updatedList.map((item: any) =>
            item.Id === response.data.Id ? { ...item, ...response.data } : item
          );
        }

        if (response?.type === "add") {
          updatedList = [response.data, ...updatedList];
        }

        if (response?.type === "delete") {
          updatedList = updatedList.filter(
            (item: any) => item.Id !== response.id
          );
        }
      });

      return updatedList.sort((a: any, b: any) => b.Id - a.Id);
    });
    setMasterState((prev: any) => {
      let updatedList = [...prev];

      allResponses.forEach((response: any) => {
        if (response?.type === "update") {
          updatedList = updatedList.map((item: any) =>
            item.Id === response.data.Id ? { ...item, ...response.data } : item
          );
        }

        if (response?.type === "add") {
          updatedList = [response.data, ...updatedList];
        }

        if (response?.type === "delete") {
          updatedList = updatedList.filter(
            (item: any) => item.Id !== response.id
          );
        }
      });

      return updatedList.sort((a: any, b: any) => b.Id - a.Id);
    });

    handleClosePopup(index); // ✅ Close after all updates
    setIsUpdateDetails({ Id: null, Type: "", isLoading: false });
  } catch (err) {
    console.error("Error in updateBedsDetails:", err);
  }
};

export const deleteBedDetails = async (
  bedId: number,
  setBedsList: any,
  handleClosePopup: any,
  index: number
) => {
  try {
    await SpServices.SPUpdateItem({
      Listname: SPLists.BedConfigList,
      ID: bedId,
      RequestJSON: { IsDelete: true },
    });
    setBedsList((prev: any) => {
      let updatedList = [...prev];
      updatedList = updatedList.filter((item: any) => item.Id !== bedId);
      return updatedList;
    });
    handleClosePopup(index);
  } catch (err) {
    console.log("Error : ", err);
  }
};

export const submitSheltersDetails = async (
  formDetails: any,
  setMasterState: any,
  setTempState: any,
  handleClosePopup: any,
  index: number
) => {
  try {
    const tempArray: any[] = [];

    // ✅ Create array of promises for SPAddItem
    const bedInsertPromises = formDetails?.Beds?.value?.map(
      async (bedDetails: any) => {
        const spPayload = {
          Title: bedDetails?.ShelterName?.value,
          Description: bedDetails?.ShelterDescription?.value,
        };

        const res = await SpServices.SPAddItem({
          Listname: SPLists.ShelterConfigList,
          RequestJSON: spPayload,
        });

        tempArray.push({
          Id: res?.data?.ID,
          ShelterName: spPayload?.Title,
          Descriptions: spPayload?.Description,
        });
      }
    );

    // ✅ Wait for all SPAddItem calls to finish
    await Promise.all(bedInsertPromises);

    // ✅ Now update UI
    setMasterState((prev: any) =>
      [...tempArray, ...prev].sort((a, b) => b.Id - a.Id)
    );
    setTempState((prev: any) =>
      [...tempArray, ...prev].sort((a, b) => b.Id - a.Id)
    );
    handleClosePopup(index); // ✅ now runs AFTER SharePoint updates
  } catch (err) {
    console.error("Error:", err);
  }
};
export const updateSheltersDetails = async (
  formDetails: any,
  deletedBedsList: any[],
  setMasterState: any,
  setSheltersList: any,
  setIsUpdateDetails: any,
  handleClosePopup: any,
  index: number
) => {
  try {
    // const newBedsArray: any[] = [];

    // const shelterId = formDetails?.ShelterName?.value?.Id;
    // const shelterName = formDetails?.ShelterName?.value?.name;

    // ✅ Process Create & Update together
    const bedPromises = formDetails?.Beds?.value?.map(
      async (bedDetails: any) => {
        const spPayload = {
          Title: bedDetails?.ShelterName?.value,
          Description: bedDetails?.ShelterDescription?.value,
        };

        if (bedDetails?.ShelterName?.Id) {
          // ✅ Update existing bed
          const updated = await SpServices.SPUpdateItem({
            Listname: SPLists.ShelterConfigList,
            ID: bedDetails?.ShelterName?.Id,
            RequestJSON: spPayload,
          });
          console.log("updated", updated);

          return {
            type: "update",
            data: {
              Id: bedDetails?.ShelterName?.Id,
              ShelterName: spPayload.Title,
              Descriptions: spPayload.Description,
            },
          };
        } else {
          // ✅ Create new bed
          const res = await SpServices.SPAddItem({
            Listname: SPLists.ShelterConfigList,
            RequestJSON: spPayload,
          });

          return {
            type: "add",
            data: {
              Id: res?.data?.ID,
              ShelterName: spPayload.Title,
              Descriptions: spPayload.Description,
            },
          };
        }
      }
    );

    // ✅ Process deletions
    const deletePromises = deletedBedsList.map(async (bedId) => {
      await SpServices.SPUpdateItem({
        Listname: SPLists.ShelterConfigList,
        ID: bedId,
        RequestJSON: { IsDelete: true },
      });

      return { type: "delete", id: bedId };
    });

    // ✅ Await all SharePoint calls
    const allResponses = await Promise.all([...bedPromises, ...deletePromises]);

    // ✅ Prepare new temp list
    setSheltersList((prev: any) => {
      let updatedList = [...prev];

      allResponses.forEach((response: any) => {
        if (response?.type === "update") {
          updatedList = updatedList.map((item: any) =>
            item.Id === response.data.Id ? { ...item, ...response.data } : item
          );
        }

        if (response?.type === "add") {
          updatedList = [response.data, ...updatedList];
        }

        if (response?.type === "delete") {
          updatedList = updatedList.filter(
            (item: any) => item.Id !== response.id
          );
        }
      });

      return updatedList.sort((a: any, b: any) => b.Id - a.Id);
    });
    setMasterState((prev: any) => {
      let updatedList = [...prev];

      allResponses.forEach((response: any) => {
        if (response?.type === "update") {
          updatedList = updatedList.map((item: any) =>
            item.Id === response.data.Id ? { ...item, ...response.data } : item
          );
        }

        if (response?.type === "add") {
          updatedList = [response.data, ...updatedList];
        }

        if (response?.type === "delete") {
          updatedList = updatedList.filter(
            (item: any) => item.Id !== response.id
          );
        }
      });

      return updatedList.sort((a: any, b: any) => b.Id - a.Id);
    });

    handleClosePopup(index); // ✅ Close after all updates
    setIsUpdateDetails((prev: any) => {
      return { ...prev, Id: null, Type: "", isLoading: false };
    });
  } catch (err) {
    console.error("Error in updateBedsDetails:", err);
  }
};
export const deleteShelterDetails = async (
  shelterId: number,
  setSheltersList: any,
  handleClosePopup: any,
  index: number
) => {
  try {
    await SpServices.SPUpdateItem({
      Listname: SPLists.ShelterConfigList,
      ID: shelterId,
      RequestJSON: { IsDelete: true },
    });
    setSheltersList((prev: any) => {
      let updatedList = [...prev];
      updatedList = updatedList.filter((item: any) => item.Id !== shelterId);
      return updatedList;
    });
    handleClosePopup(index);
  } catch (err) {
    console.log("Error : ", err);
  }
};
