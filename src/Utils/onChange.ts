/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const onChangeFunction = (
  fieldName: string,
  value: any,
  setFormDetails: any
) => {
  setFormDetails((prev: any) => ({
    ...prev,
    [fieldName]: {
      ...prev[fieldName],
      value: value,
      isValid: true, // reset validation on change
    },
  }));
};

export const rowOnChangeFunction = (
  fieldName: string,
  value: any,
  setFormDetails: any,
  index: number,
  onChange?: any,
  checkDuplicate: boolean = false
) => {
  setFormDetails((prevState: any) => {
    const updatedState = [...prevState];

    // 🔍 Check for duplicate value in other rows (if checkDuplicate is enabled)
    let isDuplicate = false;
    if (checkDuplicate) {
      isDuplicate = updatedState.some((row, i) => {
        return (
          i !== index &&
          row[fieldName]?.value?.toLowerCase?.() === value?.toLowerCase?.()
        );
      });
    }

    updatedState[index] = {
      ...updatedState[index],
      [fieldName]: {
        ...updatedState[index][fieldName],
        value,
        isValid: !isDuplicate,
        errorMessage: isDuplicate ? `Duplicate data found - ${value}` : "",
      },
    };

    if (onChange) {
      onChange(updatedState, false);
    }

    return updatedState;
  });
};

export const getFirstInvalidErrorMsg = (data: any[]): string | null => {
  for (const row of data) {
    for (const key in row) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const field = row[key];
        if (field?.isValid === false && field?.errorMessage) {
          return field.errorMessage;
        }
      }
    }
  }
  return null;
};
