export const isStringSetAndNotEmpty = (value: string | undefined | null) => {
  return value !== undefined && value !== null && value.trim() !== '';
};
