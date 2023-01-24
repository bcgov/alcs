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
