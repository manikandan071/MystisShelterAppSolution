/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  deleteBedDetails,
  fetchBedDetails,
  fetchBedLogDetails,
  fetchShelterDetails,
  // submitBedsDetails,
  updateBedsDetails,
} from "../../../../../Services/ConfigurationServices";
import CustomButton from "../../Common/Buttons/Buttons";
import styles from "./BedConfig.module.scss";
import { togglePopupVisibility } from "../../../../../Utils/togglePopup";
import Popup from "../../Common/Popup/Popup";
import CustomDropDown from "../../Common/CustomInputs/CustomDropDown";
import CustomInputBox from "../../Common/CustomInputs/CustomInputBox";
import { deepClone } from "../../../../../Utils/deepClone";
import {
  getFirstInvalidErrorMsg,
  onChangeFunction,
  rowOnChangeFunction,
} from "../../../../../Utils/onChange";
import { tempBedFormDetails } from "../../../../../Config/initialStates";
import { OnStatusRender, OnTextRender } from "../../../../../Utils/dataTable";
import {
  rowValidateFunction,
  validateForm,
} from "../../../../../Utils/validations";
import CustomTextArea from "../../Common/CustomInputs/CustomTextArea";
import * as moment from "moment";
import CustomSearchInput from "../../Common/CustomInputs/CustomSearchInput";

import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CustomToast from "../../Common/Toast/Toast";
import Tooltip from "@mui/material/Tooltip";
import { Dropdown } from "primereact/dropdown";

// const taskIcon = require("../../../assets/images/edit.png");
// const historyIcon = require("../../../assets/images/history.png");
// const deleteIcon = require("../../../assets/images/trash_active.png");

// const defaultImg = require("../../../assets/images/trash.png");
// const hoverImg = require("../../../assets/images/trash_active.png");

interface bedProps {
  Id: number;
  BedName: string;
  BedStatus: string;
  ShelterId: number;
  ShelterName: string;
  ClientName: string;
  BookedDate: string;
}
interface shelterProps {
  Id: number;
  name: string;
}
interface bedLogsProps {
  Id: number;
  BedName: string;
  BedStatus: string;
  ShelterName: string;
  ClientName: string;
  BookedStartDate: string;
  BookedEndDate: string;
}

const BedConfig: React.FC = () => {
  const cloneFormDetails = deepClone(tempBedFormDetails);
  const initialPopupController = [
    {
      open: false,
      popupTitle: "",
      popupWidth: "65%",
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
    {
      open: false,
      popupTitle: "",
      popupWidth: "70%",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
    },
  ];
  const handleClosePopup = (index?: any): void => {
    togglePopupVisibility(setPopupController, index, "close");
  };

  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  const [formDetails, setFormDetails] = useState(deepClone(cloneFormDetails));
  const [newBedsList, setNewBedsList] = useState<any[]>([
    {
      BedName: {
        value: "",
        isValid: true,
        isMandatory: true,
      },
      BedDescription: {
        value: "",
        isValid: true,
        isMandatory: false,
      },
    },
  ]);
  const [deletedBedsList, setDeletedBedsList] = useState<any[]>([]);
  const [isUpdateDetails, setIsUpdateDetails] = useState<any>({
    Id: null,
    Type: "new",
    isLoading: false,
  });

  const [bedLogsList, setBedLogsList] = useState<bedLogsProps[]>([]);
  const [masterBedslist, setMasterBedslist] = useState<bedProps[]>([]);
  const [tempBedslist, setTempBedsList] = useState<bedProps[]>([]);
  const [sheltersList, setSheltersList] = useState<shelterProps[]>([]);
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<any>({
    SearchValue: "",
    ShelterValue: "",
    ShelterDrpValue: [],
  });
  const [toastResponse, setToastResponse] = useState<any>({
    severity: "",
    summary: "",
    detail: "",
    life: 3000,
  });

  const onChange = (value: any, isBreakeCondition?: boolean) => {
    onChangeFunction("Beds", value, setFormDetails);
  };

  const addNewRow = () => {
    const isValid = rowValidateFunction(newBedsList, setNewBedsList, onChange);
    if (!isValid) {
      return;
    }
    const newRow = {
      BedName: {
        value: "",
        isValid: true,
        isMandatory: true,
        isDeletion: true,
      },
      BedDescription: {
        value: "",
        isValid: true,
        isMandatory: false,
      },
    };
    setNewBedsList((prevRows) => [newRow, ...prevRows]);
    onChange?.([newRow, ...newBedsList], false);
  };

  const removeRow = (bedId: number, indexToRemove: number) => {
    const updatedList = newBedsList.filter((_, index) => {
      if (_?.BedName?.Id === bedId && bedId) {
        setDeletedBedsList((prev: any) => {
          return [...prev, bedId];
        });
      }
      return index !== indexToRemove;
    });
    setNewBedsList(updatedList);
    onChange?.(updatedList, false);
  };

  const handleSubmitFuction = async (): Promise<void> => {
    const isFormValid = validateForm(formDetails, setFormDetails);
    if (isFormValid && isUpdateDetails?.Type === "update") {
      // setPopupResponseFun(setPopupResponse, 0, true, "", "");
      updateBedsDetails(
        formDetails,
        deletedBedsList,
        setMasterBedslist,
        setTempBedsList,
        setIsUpdateDetails,
        handleClosePopup,
        setToastResponse,
        0
      );
    } else if (isFormValid) {
      // submitBedsDetails(formDetails, setTempBedsList, handleClosePopup, 0);
      updateBedsDetails(
        formDetails,
        deletedBedsList,
        setMasterBedslist,
        setTempBedsList,
        setIsUpdateDetails,
        handleClosePopup,
        setToastResponse,
        0
      );
    }
  };

  const hasDuplicateBedNameInShelter = (
    data: any[],
    bedId: number,
    shelterId: number,
    shelterName: string,
    bedNameToCheck: string
  ): boolean => {
    const filtered = data.filter(
      (item) =>
        item.ShelterId === shelterId &&
        item.ShelterName.toLowerCase() === shelterName.toLowerCase() &&
        item.Id !== bedId
    );

    const duplicate = filtered.find(
      (item) => item.BedName.toLowerCase() === bedNameToCheck.toLowerCase()
    );

    return !!duplicate;
  };

  const getDateDifferenceIfStartIsGreater = (
    sDateStr: string,
    eDateStr: string
  ) => {
    const sDate = new Date(sDateStr);
    const eDate = new Date(eDateStr);

    sDate.setHours(0, 0, 0, 0);
    eDate.setHours(0, 0, 0, 0);

    const diffTime = eDate.getTime() - sDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "0days";
    return `${Math.round(diffDays)}days`;
  };

  const popupInputs: any[] = [
    [
      <div key={1} style={{ width: "100%" }}>
        <div className="section-wrapper padding-buttom-10 align-end space-between">
          <CustomDropDown
            options={sheltersList}
            disabled={isUpdateDetails?.Type === "new" ? false : true}
            onClick={(value: any) => {
              onChangeFunction("ShelterName", value, setFormDetails);
              const matchedBeds = tempBedslist
                ?.filter((bed: any) => bed?.ShelterId === value?.Id)
                ?.map((bed: any) => ({
                  BedName: {
                    value: bed?.BedName || "",
                    isValid: true,
                    isMandatory: true,
                    Id: bed?.Id,
                    isDeletion: !bed?.isPermission,
                  },
                  BedDescription: {
                    value: bed?.Description !== "-" ? bed?.Description : "",
                    isValid: true,
                    isMandatory: false,
                  },
                }));

              const initialBed = [
                {
                  BedName: {
                    value: "",
                    isValid: true,
                    isMandatory: true,
                  },
                  BedDescription: {
                    value: "",
                    isValid: true,
                    isMandatory: false,
                  },
                },
              ];

              setFormDetails({
                Beds: {
                  value: matchedBeds?.length > 0 ? matchedBeds : initialBed,
                  isValid: true,
                  isMandatory: true,
                },
                ShelterName: {
                  value: value,
                  isValid: true,
                  isMandatory: true,
                },
              });
              setNewBedsList(
                matchedBeds?.length > 0 ? matchedBeds : initialBed
              );
            }}
            value={formDetails?.ShelterName?.value}
            sectionType="three"
            labelText="Shelter Name"
            isValid={formDetails?.ShelterName?.isValid}
            ismandatory={true}
          />
          {isUpdateDetails?.Type === "new" &&
            formDetails?.ShelterName?.value !== "" && (
              <CustomButton
                btnType="primaryBtn"
                icon="pi pi-plus"
                onClick={addNewRow}
                text="Bed"
                disabled={getFirstInvalidErrorMsg(newBedsList) ? true : false}
              />
            )}
        </div>
        {/* <label
          style={{
            display: "flex",
            width: "100%",
            fontSize: "13px",
            fontWeight: "500",
            marginBottom: "5px",
          }}
        >
          Beds
        </label> */}
        {/* <fieldset className="custom-fieldset"> */}
        {/* <legend className="custom-legend">Beds</legend> */}
        <div>
          {/* <div
            style={{
              display: "flex",
              justifyContent: "end",
              marginBottom: "10px",
            }}
          >
            <CustomButton
              btnType="primaryBtn"
              icon="pi pi-plus"
              onClick={addNewRow}
              text="Bed"
            />
          </div> */}
          <div
            style={{
              display: "flex",
              width: "100%",
              gap: "33px",
              margin: "10px 0px",
              fontSize: "13px",
              fontWeight: "600",
              padding: "0px 10px",
            }}
          >
            <label style={{ width: "40%" }} className="input-label">
              Bed Name
              <span style={{ color: "red", marginLeft: "2px" }}>*</span>
            </label>
            <label className="input-label">Description</label>
          </div>
          <div
            style={{
              minHeight: "50px",
              maxHeight: "298px",
              overflow: "auto",
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              padding: "0px 10px 10px 10px",
            }}
          >
            {formDetails?.Beds?.value?.map((beds: any, index: number) => {
              return (
                <div className="section-wrapper card" key={index}>
                  <div style={{ display: "flex", width: "40%" }}>
                    <span
                      className={`${
                        beds?.BedName?.isValid
                          ? styles.sectionNumber
                          : styles.errsectionNumber
                      }`}
                    >
                      {index + 1}
                    </span>
                    <CustomInputBox
                      value={beds?.BedName?.value}
                      placeholder="Enter here"
                      labelText=""
                      // labelText={`Bed ${index + 1}`}
                      // onChange={(value: any) => {
                      //   onChangeFunction("BedName", value, setFormDetails);
                      // }}
                      onChange={(value: any) => {
                        if (isUpdateDetails?.Type === "update") {
                          const isDuplicate = hasDuplicateBedNameInShelter(
                            masterBedslist,
                            isUpdateDetails?.Id,
                            isUpdateDetails?.ShelterId,
                            isUpdateDetails?.ShelterName,
                            value
                          );
                          if (isDuplicate) {
                            setNewBedsList((prevState: any) => {
                              const updatedState = [...prevState];
                              updatedState[0] = {
                                ...updatedState[0],
                                BedName: {
                                  ...updatedState[0].BedName,
                                  value,
                                  isValid: !isDuplicate,
                                  errorMessage: isDuplicate
                                    ? `${value} already exists in ${isUpdateDetails?.ShelterName}`
                                    : "",
                                },
                              };

                              if (onChange) {
                                onChange(updatedState, false);
                              }
                              return updatedState;
                            });
                          } else {
                            rowOnChangeFunction(
                              "BedName",
                              value,
                              setNewBedsList,
                              index,
                              onChange,
                              true
                            );
                          }
                        } else {
                          rowOnChangeFunction(
                            "BedName",
                            value,
                            setNewBedsList,
                            index,
                            onChange,
                            true
                          );
                        }
                      }}
                      sectionType="one-89"
                      inputType="text"
                      customClassName="right-redious-only"
                      isValid={beds?.BedName?.isValid}
                      onFoucs={beds?.BedName?.value === "" ? true : false}
                      readOnly={!formDetails?.ShelterName?.value}
                    />
                  </div>
                  <CustomTextArea
                    value={beds?.BedDescription?.value}
                    placeholder="Enter here"
                    labelText=""
                    onChange={(value: any) => {
                      rowOnChangeFunction(
                        "BedDescription",
                        value,
                        setNewBedsList,
                        index,
                        onChange
                      );
                    }}
                    sectionType="two"
                    inputType="text"
                    customClassName=""
                    isValid={beds?.BedDescription?.isValid}
                    readOnly={!formDetails?.ShelterName?.value}
                  />
                  {isUpdateDetails?.Type === "new" &&
                    newBedsList.length > 1 &&
                    beds?.BedName?.isDeletion && (
                      <div style={{ alignSelf: "center" }}>
                        {getFirstInvalidErrorMsg(newBedsList) ? (
                          !beds?.BedName?.isValid && (
                            <DeleteIcon
                              onClick={() =>
                                removeRow(beds?.BedName?.Id, index)
                              }
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
                          )
                        ) : (
                          <DeleteIcon
                            onClick={() => removeRow(beds?.BedName?.Id, index)}
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
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
        {/* </fieldset> */}
      </div>,
    ],
    [
      <div key={2}>
        <p style={{ fontSize: "15px", fontWeight: "500", margin: "0px" }}>
          Are you sure want to delete the bed?
        </p>
      </div>,
    ],
    [
      <div key={3} className="custom-data-table">
        <DataTable
          value={bedLogsList}
          className="min_height_55vh"
          scrollable
          scrollHeight="55vh"
          style={{ minWidth: "100%", minHeight: "30Vh", maxHeight: "65vh" }}
          key={0}
          paginator={bedLogsList?.length > 10}
          rows={9}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} ${
            bedLogsList?.length === 1 ? "record" : "records"
          }`}
          //   emptyMessage="No data found."
          emptyMessage={() => {
            return isUpdateDetails?.isLoading ? (
              <div
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  // height: "30vh",
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
            field="ShelterName"
            header="Shelter Name"
            style={{ width: "20%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.ShelterName} isBold={true} />
            )}
          />
          <Column
            field="BedName"
            header="Bed Name"
            style={{ width: "20%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.BedName} isBold={true} />
            )}
          />
          {/* <Column
            field="BedStatus"
            header="Bed Status"
            style={{ width: "15%" }}
            body={(rowData) => <OnStatusRender status={rowData?.BedStatus} />}
          ></Column> */}
          <Column
            field="ClientName"
            header="Client Name"
            style={{ width: "15%" }}
            body={(rowData) => <OnTextRender text={rowData?.ClientName} />}
          />
          <Column
            field="BookedStartDate"
            header="Occupied On"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender
                text={moment(rowData?.BookedStartDate).format("DD-MM-YYYY")}
              />
            )}
          />
          <Column
            field="BookedEndDate"
            header="Vacated On"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender
                text={
                  rowData?.BookedEndDate !== "-"
                    ? moment(rowData?.BookedEndDate).format("DD-MM-YYYY")
                    : "-"
                }
              />
            )}
          />
          <Column
            field="BookedEndDate"
            header="Occupied Days"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender
                text={
                  rowData?.BookedEndDate !== "-" &&
                  rowData?.BookedStartDate !== "-"
                    ? getDateDifferenceIfStartIsGreater(
                        rowData?.BookedStartDate,
                        rowData?.BookedEndDate
                      )
                    : "-"
                }
              />
            )}
          />
        </DataTable>
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
        onClick: () => {
          handleClosePopup(0);
          setNewBedsList([
            {
              BedName: {
                value: "",
                isValid: true,
                isMandatory: true,
              },
              BedDescription: {
                value: "",
                isValid: true,
                isMandatory: false,
              },
            },
          ]);
          setFormDetails(deepClone(cloneFormDetails));
          setIsUpdateDetails({
            Id: null,
            Type: "new",
            isLoading: false,
          });
          setDeletedBedsList([]);
        },
      },
      {
        text: "Submit",
        btnType: "primaryBtn",
        startIcon: "pi pi-check-circle",
        disabled:
          formDetails?.ShelterName?.value === ""
            ? true
            : getFirstInvalidErrorMsg(newBedsList)
            ? true
            : false,
        onClick: () => {
          rowValidateFunction(newBedsList, setNewBedsList, onChange);
          handleSubmitFuction();
        },
      },
    ],
    [
      {
        text: "No",
        btnType: "closeBtn",
        disabled: false,
        startIcon: "pi pi-times-circle",
        onClick: () => {
          handleClosePopup(1);
          setIsUpdateDetails({
            Id: null,
            Type: "",
            isLoading: false,
          });
        },
      },
      {
        text: "Yes",
        btnType: "primaryBtn",
        disabled: false,
        startIcon: "pi pi-check-circle",
        onClick: () => {
          if (isUpdateDetails?.Type === "delete") {
            deleteBedDetails(
              isUpdateDetails?.Id,
              setTempBedsList,
              handleClosePopup,
              setToastResponse,
              1
            );
          }
        },
      },
    ],
    [
      {
        text: "Close",
        btnType: "closeBtn",
        disabled: false,
        startIcon: "pi pi-times-circle",
        onClick: () => {
          handleClosePopup(2);
          setIsUpdateDetails({
            Id: null,
            Type: "",
            isLoading: false,
          });
        },
      },
    ],
  ];

  const openAddFormPopup = () => {
    setIsUpdateDetails({ Id: null, Type: "new", isLoading: false });
    setFormDetails(deepClone(cloneFormDetails));
    togglePopupVisibility(setPopupController, 0, "open", `Add Beds`);
  };
  useEffect(() => {
    fetchShelterDetails(setSheltersList);
    fetchBedDetails(
      setMasterBedslist,
      setTempBedsList,
      setSearchQuery,
      setIsLoader
    );
  }, []);
  useEffect(() => {
    if (isUpdateDetails?.Type === "history") {
      fetchBedLogDetails(
        isUpdateDetails?.Id,
        setBedLogsList,
        setIsUpdateDetails
      );
    }
  }, [isUpdateDetails?.Id]);

  useEffect(() => {
    if (isUpdateDetails?.Type === "update" && isUpdateDetails?.Id !== null) {
      const matchedShelter = sheltersList.find(
        (shelter: any) =>
          shelter?.Id === isUpdateDetails?.ShelterId ||
          shelter?.Title === isUpdateDetails?.ShelterName
      );

      const shelterId = matchedShelter?.Id || isUpdateDetails?.ShelterId;
      const shelterName = matchedShelter?.name || isUpdateDetails?.ShelterName;

      const matchedBeds = tempBedslist
        ?.filter((bed: any) => bed?.Id === isUpdateDetails?.Id)
        ?.map((bed: any) => ({
          BedName: {
            value: bed?.BedName || "",
            isValid: true,
            isMandatory: true,
            Id: bed?.Id,
          },
          BedDescription: {
            value: bed?.Description !== "-" ? bed?.Description : "",
            isValid: true,
            isMandatory: false,
          },
        }));

      setFormDetails({
        Beds: {
          value: matchedBeds,
          isValid: true,
          isMandatory: true,
        },
        ShelterName: {
          value: {
            Id: shelterId,
            name: shelterName,
          },
          isValid: true,
          isMandatory: true,
        },
      });

      setNewBedsList(matchedBeds);
      togglePopupVisibility(setPopupController, 0, "open", "Update Bed");
    }
    // else {
    //   handleClosePopup(0);
    // }
  }, [isUpdateDetails?.Id, isUpdateDetails?.Type, tempBedslist, sheltersList]);

  // const filterShelterBeds = (ShelterId: number, shelterName: string) => {
  //   const tempFilteredData = tempBedslist
  //     ?.filter((bed: any) => bed?.ShelterId === ShelterId)
  //     .map((bed: any) => {
  //       return {
  //         BedName: {
  //           value: bed?.BedName,
  //           isValid: true,
  //           isMandatory: true,
  //           Id: bed?.Id,
  //         },
  //         BedDescription: {
  //           value: bed?.Description !== "-" ? bed?.Description : "",
  //           isValid: true,
  //           isMandatory: false,
  //         },
  //       };
  //     });
  //   setFormDetails((prev: any) => {
  //     return {
  //       ...prev,
  //       Beds: {
  //         value: tempFilteredData,
  //         isValid: true,
  //         isMandatory: true,
  //       },
  //       ShelterName: {
  //         value: { Id: ShelterId, name: shelterName },
  //         isValid: true,
  //         isMandatory: true,
  //       },
  //     };
  //   });
  //   setNewBedsList([...tempFilteredData]);
  //   togglePopupVisibility(setPopupController, 0, "open", `Update Beds`);
  // };

  const actionBoadyTemplate = (rowData: any) => {
    return (
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <Tooltip title="Edit">
          <EditIcon
            // title="Edit Bed"
            onClick={() => {
              setIsUpdateDetails({
                Id: rowData?.Id,
                BedName: rowData?.Bedname,
                ShelterId: rowData?.ShelterId,
                ShelterName: rowData?.ShelterName,
                Type: "update",
                isLoading: false,
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
        <Tooltip title="Log">
          <ScheduleIcon
            // title="Bed Logs"
            onClick={() => {
              setIsUpdateDetails({
                Id: rowData?.Id,
                Type: "history",
                isLoading: false,
              });
              togglePopupVisibility(
                setPopupController,
                2,
                "open",
                `Log - ${rowData?.BedName} `
              );
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
        {!rowData?.isPermission && (
          <Tooltip title="Delete">
            <DeleteIcon
              // title="Delete Bed"
              onClick={() => {
                setIsUpdateDetails({
                  Id: rowData?.Id,
                  Type: "delete",
                  isLoading: false,
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
        )}
      </div>
    );
  };

  const searchAndFilter = (
    value: string | { code: string; name: string },
    key: string
  ) => {
    // Update state of search + dropdown together
    setSearchQuery((prev: any) => {
      const newQuery = { ...prev, [key]: value };

      let filteredList = masterBedslist;

      // 1. Filter by shelter if selected
      if (newQuery.ShelterValue && newQuery.ShelterValue.name) {
        filteredList = filteredList.filter(
          (bed: bedProps) =>
            bed?.ShelterName?.toLowerCase() ===
            newQuery.ShelterValue.name.toLowerCase()
        );
      }

      // 2. Filter by search text if entered
      if (newQuery.SearchValue && newQuery.SearchValue.trim() !== "") {
        filteredList = filteredList.filter(
          (bed: bedProps) =>
            bed?.BedName?.toLowerCase().includes(
              newQuery.SearchValue.toLowerCase()
            ) ||
            bed?.ShelterName?.toLowerCase().includes(
              newQuery.SearchValue.toLowerCase()
            ) ||
            bed?.BedStatus?.toLowerCase().includes(
              newQuery.SearchValue.toLowerCase()
            )
        );
      }

      setTempBedsList(filteredList);

      return newQuery;
    });
  };

  // const findOccupiedDays = (date: any) => {
  //   const inputDate = new Date(date);
  //   const today = new Date();

  //   // Convert both dates to the same timezone (remove time part)
  //   const inputDateOnly = new Date(
  //     inputDate.getFullYear(),
  //     inputDate.getMonth(),
  //     inputDate.getDate()
  //   );
  //   const todayDateOnly = new Date(
  //     today.getFullYear(),
  //     today.getMonth(),
  //     today.getDate()
  //   );
  //   const diffTime = Math.abs(
  //     todayDateOnly.getTime() - inputDateOnly.getTime()
  //   );
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   const result = diffDays === 1 ? "1 day" : `${diffDays} days`;

  //   return result;
  // };

  return (
    <div style={{ width: "100%" }}>
      <CustomToast
        toastResponse={toastResponse}
        setToastResponse={setToastResponse}
      />
      <div className={styles.dashboardHeader}>
        <span className={styles.heading}>Bed Details</span>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Dropdown
            style={{ width: "250px", height: "32px" }}
            value={searchQuery.ShelterValue}
            onChange={(e) => searchAndFilter(e.value, "ShelterValue")}
            options={searchQuery.ShelterDrpValue}
            optionLabel="name"
            placeholder="Select a shelter"
          />
          <CustomSearchInput
            width="330px"
            value={searchQuery?.SearchValue}
            placeholder="Search"
            disabled={isLoader}
            onChange={(value: string) => {
              searchAndFilter(value, "SearchValue");
            }}
          />
          <Tooltip title="Reset Filter">
            <RestartAltIcon
              onClick={() => {
                setTempBedsList([...masterBedslist]);
                setSearchQuery((prev: any) => {
                  return {
                    ...prev,
                    SearchValue: "",
                    ShelterValue: "",
                  };
                });
              }}
              sx={{
                cursor: "pointer",
                backgroundColor: "#e7f0e7de",
                padding: "4px",
                borderRadius: "6px",
                fontSize: "32px",
                color: "#b99223",
                "&:hover": {
                  backgroundColor: "#cbfbbbc2",
                },
              }}
            />
          </Tooltip>
          <CustomButton
            btnType="primaryBtn"
            // icon="pi pi-plus"
            onClick={openAddFormPopup}
            text="Add Beds"
          />
        </div>
      </div>
      <div className="custom-data-table">
        <DataTable
          value={tempBedslist}
          className="min_height_69vh"
          scrollable
          scrollHeight="60vh"
          style={{ minWidth: "100%" }}
          key={0}
          paginator={tempBedslist?.length > 0}
          rows={9}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} ${
            tempBedslist?.length === 1 ? "record" : "records"
          }`}
          //   emptyMessage="No data found."
          emptyMessage={() => {
            return isLoader ? (
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
            field="BedName"
            header="Bed Name"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.BedName} isBold={true} />
            )}
          />
          <Column
            field="ShelterName"
            header="Shelter Name"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.ShelterName} isBold={true} />
            )}
          />
          <Column
            field="ClientName"
            header="Client Name"
            style={{ width: "15%" }}
            body={(rowData) => <OnTextRender text={rowData?.ClientName} />}
          />
          <Column
            field="BookedDate"
            header="Bed Occupied On"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender
                text={
                  rowData?.BookedDate !== "-"
                    ? moment(rowData?.BookedDate).format("DD-MM-YYYY")
                    : "-"
                }
              />
            )}
          />
          <Column
            field="BookedDate"
            header="Occupied Days"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender
                text={
                  rowData.BookedDate !== "-"
                    ? getDateDifferenceIfStartIsGreater(
                        rowData.BookedDate,
                        new Date().toISOString()
                      )
                    : "-"
                }
                isBold={true}
              />
            )}
          />
          <Column
            field="BedStatus"
            header="Bed Status"
            style={{ width: "15%" }}
            body={(rowData) => <OnStatusRender status={rowData?.BedStatus} />}
          />
          <Column
            field="Id"
            header="Action"
            style={{ width: "10%" }}
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
          errorMessage={
            // formDetails?.ShelterName?.value === "" && index === 0
            //   ? "Please select shelter"
            //   :
            getFirstInvalidErrorMsg(newBedsList)
          }
        />
      ))}
    </div>
  );
};

export default BedConfig;
