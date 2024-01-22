export const formatStringToPostgresSearchStringArrayWithWildCard = (
  input: string,
): string => {
  input = input.trim();
  const splitString = input.split(' ');
  let output = '';

  if (splitString.length === 1) {
    output = splitString.map((word) => `%${word}%`.toLowerCase()).join(',');
    return `{${output}}`;
  }

  output = splitString
    .map((word) => `%${word}%`.trim().toLowerCase())
    .join(',');
  output += `,%${input}%`;
  return `{${output}}`;
};
