export const formatBooleanToString = (val?: boolean | null) => {
  switch (val) {
    case true:
      return 'true';
    case false:
      return 'false';
    default:
      return undefined;
  }
};

export const formatBooleanToYesNoString = (val?: boolean | null) => {
  switch (val) {
    case true:
      return 'Yes';
    case false:
      return 'No';
    default:
      return undefined;
  }
};
