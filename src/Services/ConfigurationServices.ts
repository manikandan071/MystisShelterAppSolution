/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */

import { SPLists } from "../Config/Config";
import SpServices from "./SPServices/SpServices";

const fetchUsedShetersData = async () => {
  try {
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
        {
          FilterKey: "Status",
          Operator: "ne",
          FilterValue: "Closed",
        },
      ],
      Orderby: "ID",
      Orderbydecorasc: false,
    });
    const uniqueShelterBeds = Array.from(
      new Map(
        requestResponse
          .filter((data: any) => data.Shelter?.Title && data.Bed?.Title)
          .map((data: any) => [
            `${data.Shelter.Title}-${data.Bed.Title}`, // unique key
            {
              Shelter: data.Shelter.Title,
              ShelterId: data.Shelter.Id,
              Bed: data.Bed.Title,
              BedId: data.Bed.Id,
            },
          ])
      ).values()
    );
    return uniqueShelterBeds;
  } catch (err) {
    console.log("Error : ", err);
  }
};

export const fetchShelterDetailsMaster = async (
  setMasterState: any,
  setTempState: any,
  isLoader: any
) => {
  try {
    isLoader(true);
    const usedSheltersList: any = await fetchUsedShetersData();
    const usedShelterIds = new Set(
      usedSheltersList?.map((item: any) => item.ShelterId)
    );
    const shelterListResponse = await SpServices.SPReadItems({
      Listname: SPLists.ShelterConfigList,
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
    const tempBedDetails = shelterListResponse?.map((shelter: any) => {
      const shelterId = shelter?.ID;
      return {
        Id: shelterId,
        ShelterName: shelter?.Title,
        Descriptions: shelter?.Description,
        isPermission: usedShelterIds.has(shelterId),
      };
    });
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
  setSearchQuery: any,
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
          isPermission: bed?.AvailabilityStatus !== "Available" ? true : false,
        };
      })
      .sort((a, b) => b.Id - a.Id);

    setMasterBedslist(tempBedDetails);
    setTempBedsList(tempBedDetails);
    const uniqueShelters = Array.from(
      new Map(
        bedListResponse.map((bed: any) => [
          bed?.Shelter?.Id,
          {
            code: bed?.Shelter?.Id,
            name: bed?.Shelter?.Title,
          },
        ])
      ).values()
    );
    setSearchQuery((prev: any) => {
      return { ...prev, ShelterDrpValue: uniqueShelters };
    });
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
  setToastResponse: any,
  index: number
) => {
  try {
    const shelterId = formDetails?.ShelterName?.value?.Id;
    const shelterName = formDetails?.ShelterName?.value?.name;

    const bedPromises = formDetails?.Beds?.value?.map(
      async (bedDetails: any) => {
        const spPayload = {
          Title: bedDetails?.BedName?.value,
          ShelterId: shelterId,
          Description: bedDetails?.BedDescription?.value,
        };

        if (bedDetails?.BedName?.Id) {
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

    const deletePromises = deletedBedsList.map(async (bedId) => {
      await SpServices.SPUpdateItem({
        Listname: SPLists.BedConfigList,
        ID: bedId,
        RequestJSON: { IsDelete: true },
      });

      return { type: "delete", id: bedId };
    });

    const allResponses = await Promise.all([...bedPromises, ...deletePromises]);

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
    setToastResponse({
      severity: "success",
      summary: "Sccuess",
      detail: "Bed configured successfully!",
      life: 3000,
    });
  } catch (err) {
    console.error("Error in updateBedsDetails:", err);
  }
};

export const deleteBedDetails = async (
  bedId: number,
  setBedsList: any,
  handleClosePopup: any,
  setToastResponse: any,
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
    setToastResponse({
      severity: "success",
      summary: "Sccuess",
      detail: "Bed deleted successfully!",
      life: 3000,
    });
  } catch (err) {
    console.log("Error : ", err);
  }
};

export const submitSheltersDetails = async (
  setIsLoader: any,
  formDetails: any,
  setMasterState: any,
  setTempState: any,
  handleClosePopup: any,
  setToastResponse: any,
  index: number
) => {
  try {
    setIsLoader(true);
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
    handleClosePopup(index);
    setIsLoader(false);
    setToastResponse({
      severity: "success",
      summary: "Sccuess",
      detail: "Shelter configured successfully!",
      life: 3000,
    });
  } catch (err) {
    console.error("Error:", err);
  }
};
export const updateSheltersDetails = async (
  setIsLoader: any,
  formDetails: any,
  deletedBedsList: any[],
  setMasterState: any,
  setSheltersList: any,
  setIsUpdateDetails: any,
  handleClosePopup: any,
  setToastResponse: any,
  index: number
) => {
  try {
    setIsLoader(true);
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
    setIsLoader(false);
    setToastResponse({
      severity: "success",
      summary: "Sccuess",
      detail: "Shelter configured successfully!",
      life: 3000,
    });
  } catch (err) {
    console.error("Error in updateBedsDetails:", err);
  }
};
export const deleteShelterDetails = async (
  setIsLoader: any,
  shelterId: number,
  setMasterSheltersList: any,
  setSheltersList: any,
  handleClosePopup: any,
  setToastResponse: any,
  index: number
) => {
  try {
    setIsLoader(true);
    await SpServices.SPUpdateItem({
      Listname: SPLists.ShelterConfigList,
      ID: shelterId,
      RequestJSON: { IsDelete: true },
    });

    const shelterBedList = await SpServices.SPReadItems({
      Listname: SPLists.BedConfigList,
      Select: "*,Shelter/Id,Shelter/Title",
      Expand: "Shelter",
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "ne",
          FilterValue: 1,
        },
        {
          FilterKey: "ShelterId",
          Operator: "eq",
          FilterValue: shelterId,
        },
      ],
    });

    shelterBedList.map(async (bed: any) => {
      await SpServices.SPUpdateItem({
        Listname: SPLists.BedConfigList,
        ID: bed?.Id,
        RequestJSON: { IsDelete: true },
      });
    });

    setMasterSheltersList((prev: any) => {
      let updatedList = [...prev];
      updatedList = updatedList.filter((item: any) => item.Id !== shelterId);
      return updatedList;
    });
    setSheltersList((prev: any) => {
      let updatedList = [...prev];
      updatedList = updatedList.filter((item: any) => item.Id !== shelterId);
      return updatedList;
    });
    handleClosePopup(index);
    setIsLoader(false);
    setToastResponse({
      severity: "success",
      summary: "Sccuess",
      detail: "Shelter deleted successfully!",
      life: 3000,
    });
  } catch (err) {
    console.log("Error : ", err);
  }
};

export const fetchUserGroupsAndUsers = async (
  setSupervisorList: any,
  setBillingteamList: any,
  setApproverList: any,
  setMasterList: any,
  setIsLoading: any
) => {
  try {
    const groupsResponse = await SpServices.SPReadItems({
      Listname: SPLists.UserConfigList,
      Select: "ID,Role,Users/Id,Users/Title,Users/EMail",
      Expand: "Users",
    });

    // const supervisorList: any[] = [];
    // const billingTeamList: any[] = [];
    // const approversList: any[] = [];
    const masterList = {
      supervisorList: [],
      billingTeamList: [],
      approverList: [],
    };

    groupsResponse?.forEach((group) => {
      const formattedUsers = (group?.Users || []).map(
        (user: any, index: number) => ({
          sNo: index + 1,
          userId: user?.Id,
          userName: user?.Title,
          userEmail: user?.EMail,
        })
      );

      const groupData = {
        groupId: group?.ID,
        role: group?.Role,
        users: formattedUsers,
      };

      switch (group?.Role) {
        case "Supervisor":
          setSupervisorList(groupData);
          masterList.supervisorList = formattedUsers;
          break;
        case "Billing Team":
          setBillingteamList(groupData);
          masterList.billingTeamList = formattedUsers;
          break;
        case "Chief of Approval":
          setApproverList(groupData);
          masterList.approverList = formattedUsers;
          break;
        default:
          break;
      }
    });
    setMasterList(masterList);
    setIsLoading(false);
  } catch (err) {
    console.log("Error fetching user groups:", err);
  }
};

import { sp } from "@pnp/sp/presets/all";

export const userUpdateSubmission = async (
  groupId: number,
  existUsers: any[],
  newUsers: any[],
  initFunction: any,
  handleClosePopup: any,
  setToastResponse: any
) => {
  try {
    const allUsers = [...existUsers, ...newUsers];
    const userIds = allUsers.map((user) => user?.id || user?.userId);
    const spPayload = {
      UsersId: { results: userIds },
    };

    await SpServices.SPUpdateItem({
      Listname: SPLists.UserConfigList,
      ID: groupId,
      RequestJSON: spPayload,
    });
    const spGroupUsers = await sp.web.siteGroups.getByName("Members").users();
    const existingEmails = spGroupUsers.map((u) => u.Email.toLowerCase());
    const usersToAdd = allUsers.filter(
      (u) => !existingEmails.includes((u.email || u.userEmail)?.toLowerCase())
    );
    for (const user of usersToAdd) {
      try {
        const ensuredUser = await sp.web.ensureUser(
          user.email || user.userEmail
        );
        await sp.web.siteGroups
          .getByName("Members")
          .users.add(ensuredUser.data.LoginName);
      } catch (err) {
        console.log(`Failed to add user: ${user.email}`, err);
      }
    }
    setToastResponse({
      severity: "success",
      summary: "Sccuess",
      detail: "User configured successfully!",
      life: 3000,
    });
    handleClosePopup(0);
    initFunction();
  } catch (err) {
    console.log("Error updating users and SharePoint group:", err);
  }
};

export const removeUserFunction = async (
  groupId: number,
  usersToRemove: any[], // keep as array for flexibility
  existingUsers: any[], // ✅ pass in the current users of that group
  initFunction: any,
  handleClosePopup: any,
  setToastResponse: any
) => {
  try {
    // 1. Collect IDs of users to remove
    const removeIds = usersToRemove.map((u) => u?.id || u?.userId);

    // 2. Keep all existing users except the ones being removed
    const updatedUserIds = existingUsers
      ?.filter((u) => !removeIds.includes(u?.id || u?.userId))
      ?.map((u) => u?.id || u?.userId);

    // 3. Prepare payload
    const spPayload = {
      UsersId: { results: updatedUserIds },
    };

    // 4. Update SharePoint list item
    await SpServices.SPUpdateItem({
      Listname: SPLists.UserConfigList,
      ID: groupId,
      RequestJSON: spPayload,
    });

    // 5. Show success
    setToastResponse({
      severity: "success",
      summary: "Success",
      detail: "User removed successfully!",
      life: 3000,
    });

    handleClosePopup(1);
    initFunction();
  } catch (err) {
    console.error("Error : ", err);
  }
};
