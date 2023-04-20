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
