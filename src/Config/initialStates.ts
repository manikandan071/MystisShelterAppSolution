export const tempBedFormDetails = {
  ShelterName: {
    value: "",
    isValid: true,
    isMandatory: true,
  },
  Beds: {
    value: [
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
    ],
    isValid: true,
    isMandatory: true,
  },
};

export const tempShelterFormDetails = {
  Beds: {
    value: [
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
    ],
    isValid: true,
    isMandatory: true,
  },
};
