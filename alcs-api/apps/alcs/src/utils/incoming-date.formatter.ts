export const formatIncomingDate = (date?: number | null) => {
  if (date) {
    return new Date(date);
  } else if (date === null) {
    return null;
  } else {
    return undefined;
  }
};
