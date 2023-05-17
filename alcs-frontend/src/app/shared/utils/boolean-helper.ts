export const parseStringToBoolean = (val?: string | null) => {
  switch (val) {
    case 'true':
      return true;
    case 'false':
      return false;
    case null:
      return null;
    default:
      return undefined;
  }
};

export const parseBooleanToString = (val?: boolean | null) => {
  switch (val) {
    case true:
      return 'true';
    case false:
      return 'false';
    case null:
      return null;
    default:
      return undefined;
  }
};
