/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */

// 🔁 Validator for single field
const isValidField = (field: any): boolean => {
  const { value, isMandatory } = field;

  if (!isMandatory) return true;

  if (typeof value === "string") {
    return value.trim() !== "";
  } else if (Array.isArray(value)) {
    return value.length > 0;
  } else if (typeof value === "number") {
    return value !== 0 && value !== null && value !== undefined;
  } else {
    return !!value;
  }
};

// ✅ Final form validator
export const validateForm = (
  formDetails: any,
  setFormDetails: any
): boolean => {
  let isFormValid = true;
  const updatedForm = { ...formDetails };

  // 🔹 Step 1: Validate top-level fields (not Beds)
  Object.keys(updatedForm).forEach((key) => {
    if (key === "Beds") return;

    const field = updatedForm[key];
    const isValid = isValidField(field);
    updatedForm[key].isValid = isValid;

    if (!isValid) {
      isFormValid = false; // mark form invalid
    }
  });

  // 🔹 Step 2: Validate Beds
  let bedsAreValid = true;
  const updatedBeds = updatedForm.Beds.value.map((bedRow: any) => {
    const updatedBedRow: any = {};
    let rowIsValid = true;

    Object.keys(bedRow).forEach((fieldKey) => {
      const field = bedRow[fieldKey];
      const isValid = isValidField(field);

      updatedBedRow[fieldKey] = {
        ...field,
        isValid,
      };

      if (!isValid) {
        rowIsValid = false;
      }
    });

    // ❌ At least one bed row is invalid → entire beds group is invalid
    if (!rowIsValid) {
      bedsAreValid = false;
      isFormValid = false; // ✅ set global form validity
    }

    return updatedBedRow;
  });

  updatedForm.Beds = {
    ...updatedForm.Beds,
    value: updatedBeds,
    isValid: bedsAreValid,
  };

  setFormDetails(updatedForm);
  return isFormValid; // ✅ will return false if any field is invalid
};

export const rowValidateFunction = (
  formDetails: any[],
  setFormDetails: any,
  onchange?: any
) => {
  let isFormValid = true;

  const updatedFormDetails = formDetails.map((row) => {
    const updatedRow: any = {};

    Object.keys(row).forEach((key) => {
      const field = row[key];
      const value = field.value;
      const isMandatory = field.isMandatory;
      let isValid = true;

      if (!isMandatory) {
        isValid = true; // ✅ Skip validation, mark as valid
      } else {
        if (typeof value === "string") {
          isValid = value.trim() !== "";
        } else if (Array.isArray(value)) {
          isValid = value.length > 0;
        } else if (typeof value === "number") {
          isValid = value !== null && value !== undefined && value !== 0;
        } else {
          isValid = !!value;
        }

        if (!isValid) {
          isFormValid = false;
        }
      }
      updatedRow[key] = {
        ...row[key],
        isValid,
        errorMessage:
          key === "BedName"
            ? "Please enter bed name"
            : key === "ShelterName"
            ? "Please enter Shelter name"
            : "Please fill required fields",
      };
    });
    return updatedRow;
  });
  setFormDetails(updatedFormDetails);
  if (onchange) {
    onchange(updatedFormDetails);
  }
  return isFormValid;
};
