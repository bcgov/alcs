export const formatIncomingDate = (date?: number | null) => {
  if (date !== undefined && date !== null) {
    return new Date(date);
  } else if (date === null) {
    return null;
  } else {
    return undefined;
  }
};
