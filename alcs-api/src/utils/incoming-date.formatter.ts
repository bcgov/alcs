export const formatIncomingDate = (date?: number) => {
  if (date) {
    return new Date(date);
  } else if (date === null) {
    return null;
  } else {
    return undefined;
  }
};
