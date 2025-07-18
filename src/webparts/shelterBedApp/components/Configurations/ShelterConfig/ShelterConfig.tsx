/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";
import CustomButton from "../../Common/Buttons/Buttons";
import styles from "./ShelterConfig.module.scss";
import {
  deleteShelterDetails,
  fetchShelterDetailsMaster,
  submitSheltersDetails,
  updateSheltersDetails,
} from "../../../../../Services/ConfigurationServices";
import { GenerateCustomId, OnTextRender } from "../../../../../Utils/dataTable";
import { togglePopupVisibility } from "../../../../../Utils/togglePopup";
import Popup from "../../Common/Popup/Popup";
import CustomInputBox from "../../Common/CustomInputs/CustomInputBox";
import {
  getFirstInvalidErrorMsg,
  onChangeFunction,
  rowOnChangeFunction,
} from "../../../../../Utils/onChange";
import CustomTextArea from "../../Common/CustomInputs/CustomTextArea";
import { deepClone } from "../../../../../Utils/deepClone";
import {
  rowValidateFunction,
  validateForm,
} from "../../../../../Utils/validations";
import { tempShelterFormDetails } from "../../../../../Config/initialStates";
import CustomSearchInput from "../../Common/CustomInputs/CustomSearchInput";
const taskIcon = require("../../../assets/images/edit.png");
const deleteIcon = require("../../../assets/images/trash_active.png");
const defaultImg = require("../../../assets/images/trash.png");
const hoverImg = require("../../../assets/images/trash_active.png");
interface shelterProps {
  Id: number;
  ShelterName: string;
  Descriptions: string;
}
const cloneFormDetails = deepClone(tempShelterFormDetails);

const ShelterConfig: React.FC = () => {
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
  ];
  const handleClosePopup = (index?: any): void => {
    togglePopupVisibility(setPopupController, index, "close");
  };
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [isUpdateDetails, setIsUpdateDetails] = useState<any>({
    Id: null,
    Type: "new",
    isLoading: false,
  });
  const [rowIndex, setRowIndex] = useState<number | null>(null);
  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const [masterSheltersList, setMasterSheltersList] = useState<shelterProps[]>(
    []
  );
  const [sheltersList, setSheltersList] = useState<shelterProps[]>([]);
  const [newSheltersList, setNewSheltersList] = useState<any[]>([
    {
      ShelterName: {
        value: "",
        isValid: true,
        isMandatory: true,
      },
      ShelterDescription: {
        value: "",
        isValid: true,
        isMandatory: false,
      },
    },
  ]);
  const [formDetails, setFormDetails] = useState(deepClone(cloneFormDetails));
  const [deletedBedsList, setDeletedBedsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<any>({
    SearchValue: "",
  });

  const onChange = (value: any, isBreakeCondition?: boolean) => {
    onChangeFunction("Beds", value, setFormDetails);
  };

  const addNewRow = () => {
    const isValid = rowValidateFunction(
      newSheltersList,
      setNewSheltersList,
      onChange
    );
    if (!isValid) {
      return;
    }
    const newRow = {
      ShelterName: {
        value: "",
        isValid: true,
        isMandatory: true,
      },
      ShelterDescription: {
        value: "",
        isValid: true,
        isMandatory: false,
      },
    };
    setNewSheltersList((prevRows) => [newRow, ...prevRows]);
    onChange?.([newRow, ...newSheltersList], false);
  };

  const removeRow = (shelterId: number, indexToRemove: number) => {
    const updatedList = newSheltersList.filter((_, index) => {
      if (_?.ShelterName?.Id === shelterId) {
        setDeletedBedsList((prev: any) => {
          return [...prev, shelterId];
        });
      }
      return index !== indexToRemove;
    });
    setNewSheltersList(updatedList);
    onChange?.(updatedList, false);
  };

  const hasDuplicateShelterName = (
    data: any[],
    shelterId: number,
    shelterNameToCheck: string
  ): boolean => {
    const filtered = data.filter((item) => item.Id !== shelterId);

    const duplicate = filtered.find(
      (item) =>
        item.ShelterName.toLowerCase() === shelterNameToCheck.toLowerCase()
    );

    return !!duplicate;
  };

  const popupInputs: any[] = [
    [
      <div key={1} style={{ width: "100%" }}>
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
          <div
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
              text="Shelter"
              disabled={getFirstInvalidErrorMsg(newSheltersList) ? true : false}
            />
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              gap: "30px",
              margin: "10px 0px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <label style={{ width: "40%" }}>
              Shelter Name <strong style={{ color: "red" }}>*</strong>
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
            {formDetails?.Beds?.value?.map((shelter: any, index: number) => {
              return (
                <div className="section-wrapper card" key={index}>
                  <div style={{ display: "flex", width: "40%" }}>
                    <span
                      className={`${
                        shelter?.ShelterName?.isValid
                          ? styles.sectionNumber
                          : styles.errsectionNumber
                      }`}
                    >
                      {index + 1}
                    </span>
                    <CustomInputBox
                      value={shelter?.ShelterName?.value}
                      placeholder="Enter Text"
                      labelText=""
                      // labelText={`Bed ${index + 1}`}
                      // onChange={(value: any) => {
                      //   onChangeFunction("BedName", value, setFormDetails);
                      // }}
                      onChange={(value: any) => {
                        const isDuplicate = hasDuplicateShelterName(
                          masterSheltersList,
                          shelter?.ShelterName?.Id,
                          value
                        );
                        if (isDuplicate) {
                          setNewSheltersList((prevState: any) => {
                            const updatedState = [...prevState];
                            updatedState[index] = {
                              ...updatedState[index],
                              ["ShelterName"]: {
                                ...updatedState[index]["ShelterName"],
                                value,
                                isValid: !isDuplicate,
                                errorMessage: isDuplicate
                                  ? `Shelter ${value} already exists.`
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
                            "ShelterName",
                            value,
                            setNewSheltersList,
                            index,
                            onChange,
                            true
                          );
                        }
                      }}
                      sectionType="one-89"
                      inputType="text"
                      customClassName="right-redious-only"
                      isValid={shelter?.ShelterName?.isValid}
                      // onFoucs={
                      //   formDetails?.Beds?.value?.length === index + 1
                      //     ? true
                      //     : false
                      // }
                      onFoucs={
                        shelter?.ShelterName?.value === "" ? true : false
                      }
                    />
                  </div>
                  <CustomTextArea
                    value={shelter?.ShelterDescription?.value}
                    placeholder="Enter Text"
                    labelText=""
                    // onChange={(value: any) => {
                    //   onChangeFunction("BedName", value, setFormDetails);
                    // }}
                    onChange={(value: any) => {
                      rowOnChangeFunction(
                        "ShelterDescription",
                        value,
                        setNewSheltersList,
                        index,
                        onChange
                      );
                    }}
                    sectionType="two"
                    inputType="text"
                    customClassName=""
                    isValid={shelter?.ShelterDescription?.isValid}
                  />
                  <div style={{ alignSelf: "center" }}>
                    {newSheltersList.length > 1 && (
                      <img
                        src={rowIndex === index ? hoverImg : defaultImg}
                        alt="interactive"
                        width={18}
                        height={18}
                        style={{ cursor: "pointer" }}
                        title="Delete"
                        onClick={() =>
                          removeRow(shelter?.ShelterName?.Id, index)
                        }
                        onMouseEnter={() => setRowIndex(index)}
                        onMouseLeave={() => setRowIndex(null)}
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
          Are sure want to delete{" "}
          {
            sheltersList?.filter(
              (bed: any) => bed?.Id === isUpdateDetails?.Id
            )[0]?.ShelterName
          }{" "}
          Shelter?
        </p>
      </div>,
    ],
  ];

  const handleSubmitFuction = async (): Promise<void> => {
    const isFormValid = validateForm(formDetails, setFormDetails);
    if (isFormValid && isUpdateDetails?.Type === "update") {
      // setPopupResponseFun(setPopupResponse, 0, true, "", "");
      updateSheltersDetails(
        formDetails,
        deletedBedsList,
        setMasterSheltersList,
        setSheltersList,
        setIsUpdateDetails,
        handleClosePopup,
        0
      );
    } else if (isFormValid) {
      submitSheltersDetails(
        formDetails,
        setMasterSheltersList,
        setSheltersList,
        handleClosePopup,
        0
      );
    }
  };

  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "cancelBtn",
        disabled: false,
        onClick: () => {
          handleClosePopup(0);
          setNewSheltersList([
            {
              ShelterName: {
                value: "",
                isValid: true,
                isMandatory: true,
              },
              ShelterDescription: {
                value: "",
                isValid: true,
                isMandatory: false,
              },
            },
          ]);
          setFormDetails(deepClone(cloneFormDetails));
          setIsUpdateDetails({ Id: null, Type: "new", isLoading: false });
        },
      },
      {
        text: "Submit",
        btnType: "primaryBtn",
        disabled: getFirstInvalidErrorMsg(newSheltersList) ? true : false,
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
            deleteShelterDetails(
              isUpdateDetails?.Id,
              setSheltersList,
              handleClosePopup,
              1
            );
          }
        },
      },
    ],
  ];

  const openAddFormPopup = () => {
    setIsUpdateDetails({ Id: null, Type: "new", isLoading: false });
    setFormDetails(deepClone(cloneFormDetails));
    togglePopupVisibility(setPopupController, 0, "open", `Add Shelters`);
  };

  useEffect(() => {
    fetchShelterDetailsMaster(
      setMasterSheltersList,
      setSheltersList,
      setIsLoader
    );
  }, []);

  useEffect(() => {
    if (isUpdateDetails?.Type === "update" && isUpdateDetails?.Id !== null) {
      // const matchedShelter = sheltersList.find(
      //   (shelter: any) =>
      //     shelter?.Id === isUpdateDetails?.Id
      // );

      const shelterId = isUpdateDetails?.Id;

      const matchedBeds = sheltersList
        ?.filter((shelter: any) => shelter?.Id === shelterId)
        ?.map((shelter: any) => ({
          ShelterName: {
            value: shelter?.ShelterName || "",
            isValid: true,
            isMandatory: true,
            Id: shelter?.Id,
          },
          ShelterDescription: {
            value: shelter?.Descriptions !== "-" ? shelter?.Descriptions : "",
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
      });

      setNewSheltersList(matchedBeds);
      togglePopupVisibility(setPopupController, 0, "open", "Update Shelter");
    }
    // else {
    //   handleClosePopup(0);
    // }
  }, [isUpdateDetails?.Id, isUpdateDetails?.Type, sheltersList]);

  const actionBoadyTemplate = (rowData: any) => {
    return (
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <img
          alt="edit-icon"
          src={taskIcon}
          width={20}
          height={20}
          style={{ cursor: "pointer" }}
          title="Edit Shelter"
          onClick={() => {
            setIsUpdateDetails({
              Id: rowData?.Id,
              Type: "update",
              isLoading: false,
            });
          }}
        />
        <img
          alt="delete-icon"
          src={deleteIcon}
          width={17}
          height={17}
          style={{ cursor: "pointer" }}
          title="Delete Shelter"
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
    const filteredList = masterSheltersList?.filter((shelter: shelterProps) => {
      return (
        shelter?.ShelterName.toLowerCase().includes(value?.toLowerCase()) ||
        shelter?.Descriptions?.toLowerCase().includes(value?.toLowerCase())
      );
    });
    setSheltersList(filteredList);
  };

  return (
    <div style={{ width: "100%", padding: "15px" }}>
      <div className={styles.dashboardHeader}>
        {/* <span className={styles.title}>Shelter Details</span> */}
        <div className={styles.heading}>
          Shelter Details
          <hr style={{ borderColor: "#b99223" }}></hr>
        </div>
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
            icon="pi pi-plus-circle"
            onClick={openAddFormPopup}
            text="Add Shelter"
          />
        </div>
      </div>
      <div className="custom-data-table">
        <DataTable
          value={sheltersList}
          className="min_height_68vh"
          scrollable
          scrollHeight="60vh"
          style={{ minWidth: "100%" }}
          key={0}
          paginator={sheltersList?.length > 0}
          rows={10}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} ${
            sheltersList?.length === 1 ? "record" : "records"
          }`}
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
            field="Id"
            header="Shelter ID"
            style={{ width: "20%" }}
            body={(rowData) => <GenerateCustomId id={rowData?.Id} prefix="S" />}
            sortable={true}
          />
          <Column
            field="ShelterName"
            header="Shelter Name"
            style={{ width: "30%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.ShelterName} isBold={true} />
            )}
            sortable={true}
          />
          <Column
            field="Descriptions"
            header="Descriptions"
            style={{ width: "40%" }}
            body={(rowData) => (
              <OnTextRender text={rowData?.Descriptions} isBold={true} />
            )}
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
          errorMessage={getFirstInvalidErrorMsg(newSheltersList)}
        />
      ))}
    </div>
  );
};

export default ShelterConfig;
