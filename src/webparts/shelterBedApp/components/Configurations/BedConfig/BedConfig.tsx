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

const taskIcon = require("../../../assets/images/edit.png");
const historyIcon = require("../../../assets/images/history.png");
const deleteIcon = require("../../../assets/images/trash_active.png");

const defaultImg = require("../../../assets/images/trash.png");
const hoverImg = require("../../../assets/images/trash_active.png");

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
      popupWidth: "80%",
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
      popupWidth: "80%",
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

  // const [popupResponse, setPopupResponse] = useState(initialPopupResponse);
  const [rowIndex, setRowIndex] = useState<number | null>(null);
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

  const popupInputs: any[] = [
    [
      <div key={1} style={{ width: "100%" }}>
        <div className="section-wrapper padding-buttom-10 align-end space-between">
          <CustomDropDown
            options={sheltersList}
            disabled={false}
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
          {isUpdateDetails?.Type === "new" && (
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
              gap: "30px",
              margin: "10px 0px",
              fontSize: "13px",
              fontWeight: "600",
              padding: "0px 10px",
            }}
          >
            <label style={{ width: "40%" }}>
              Bed Name <strong style={{ color: "red" }}>*</strong>
            </label>
            <label>Description</label>
          </div>
          <div
            style={{
              minHeight: "50px",
              maxHeight: "282px",
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
                      placeholder="Enter Text"
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
                                ["BedName"]: {
                                  ...updatedState[0]["BedName"],
                                  value,
                                  isValid: !isDuplicate,
                                  errorMessage: isDuplicate
                                    ? `Bed ${value} already exists in ${isUpdateDetails?.ShelterName}`
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
                      // onFoucs={
                      //   formDetails?.Beds?.value?.length === index + 1
                      //     ? true
                      //     : false
                      // }
                      onFoucs={beds?.BedName?.value === "" ? true : false}
                      readOnly={!formDetails?.ShelterName?.value}
                    />
                  </div>
                  <CustomTextArea
                    value={beds?.BedDescription?.value}
                    placeholder="Enter Text"
                    labelText=""
                    // onChange={(value: any) => {
                    //   onChangeFunction("BedName", value, setFormDetails);
                    // }}
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
                  <div style={{ alignSelf: "center" }}>
                    {newBedsList.length > 1 && (
                      <img
                        src={rowIndex === index ? hoverImg : defaultImg}
                        alt="Icon"
                        width={18}
                        height={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => removeRow(beds?.BedName?.Id, index)}
                        onMouseEnter={() => setRowIndex(index)}
                        onMouseLeave={() => setRowIndex(null)}
                        title="Delete"
                      />
                    )}
                  </div>
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
          Are sure want to delete{""}
          {
            tempBedslist?.filter(
              (bed: any) => bed?.Id === isUpdateDetails?.Id
            )[0]?.BedName
          }{" "}
          bed?
        </p>
      </div>,
    ],
    [
      <div key={3} className="custom-data-table">
        <DataTable
          value={bedLogsList}
          scrollable
          scrollHeight="60vh"
          style={{ minWidth: "100%", minHeight: "30Vh", maxHeight: "65vh" }}
          key={0}
          paginator={bedLogsList?.length > 0}
          rows={10}
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
            header="Booking Start Date"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender
                text={moment(rowData?.BookedStartDate).format("DD-MM-YYYY")}
              />
            )}
          />
          <Column
            field="BookedEndDate"
            header="Booking End Date"
            style={{ width: "15%" }}
            body={(rowData) => (
              <OnTextRender
                text={moment(rowData?.BookedEndDate).format("DD-MM-YYYY")}
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
        btnType: "cancelBtn",
        disabled: false,
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
        disabled: getFirstInvalidErrorMsg(newBedsList) ? true : false,
        onClick: () => {
          handleSubmitFuction();
        },
      },
    ],
    [
      {
        text: "No",
        btnType: "cancelBtn",
        disabled: false,
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
        onClick: () => {
          if (isUpdateDetails?.Type === "delete") {
            deleteBedDetails(
              isUpdateDetails?.Id,
              setTempBedsList,
              handleClosePopup,
              1
            );
          }
        },
      },
    ],
    [
      {
        text: "Close",
        btnType: "cancelBtn",
        disabled: false,
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
    fetchBedDetails(setMasterBedslist, setTempBedsList, setIsLoader);
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
        <img
          alt="edit-icon"
          src={taskIcon}
          width={20}
          height={20}
          style={{ cursor: "pointer" }}
          title="Edit Bed"
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
        />

        <img
          alt="history-icon"
          src={historyIcon}
          width={18}
          height={18}
          style={{ cursor: "pointer" }}
          title="Bed Logs"
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
              `Bed logs - ${rowData?.BedName} `
            );
          }}
        />
        <img
          alt="delete-icon"
          src={deleteIcon}
          width={17}
          height={17}
          style={{ cursor: "pointer" }}
          title="Delete Bed"
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
        />
      </div>
    );
  };

  const searchAndFilter = (value: string, key: string) => {
    setSearchQuery((prev: any) => {
      return { ...prev, [key]: value };
    });
    const filteredList = masterBedslist?.filter((bed: bedProps) => {
      return (
        bed?.BedName.toLowerCase().includes(value?.toLowerCase()) ||
        bed?.ShelterName?.toLowerCase().includes(value?.toLowerCase())
      );
    });
    setTempBedsList(filteredList);
  };

  return (
    <div style={{ width: "100%" }}>
      <div className={styles.dashboardHeader}>
        <span className={styles.title}>Bed Details</span>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <CustomSearchInput
            value={searchQuery?.SearchValue}
            placeholder="Search"
            disabled={isLoader}
            onChange={(value: string) => {
              searchAndFilter(value, "SearchValue");
            }}
          />
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
          className="min_height_68vh"
          scrollable
          scrollHeight="60vh"
          style={{ minWidth: "100%" }}
          key={0}
          paginator={tempBedslist?.length > 0}
          rows={10}
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
            style={{ width: "20%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.BedName} isBold={true} />
            )}
          />
          <Column
            field="ShelterName"
            header="Shelter Name"
            style={{ width: "20%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.ShelterName} isBold={true} />
            )}
          />
          <Column
            field="BedStatus"
            header="Bed Status"
            style={{ width: "15%" }}
            body={(rowData) => <OnStatusRender status={rowData?.BedStatus} />}
          />
          <Column
            field="ClientName"
            header="Client Name"
            style={{ width: "15%" }}
            body={(rowData) => <OnTextRender text={rowData?.ClientName} />}
          />
          <Column
            field="BookedDate"
            header="Booked Date"
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
            field="Id"
            header="Action"
            style={{ width: "15%" }}
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
          errorMessage={getFirstInvalidErrorMsg(newBedsList)}
        />
      ))}
    </div>
  );
};

export default BedConfig;
