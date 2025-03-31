export const formatNameSearchString = (input: string): string | null => {
  return input
    .split(/\s+/)
    .filter((word) => word !== '')
    .map((word) => {
      const matches = word
        .toLowerCase()
        .match(/^(\%)?([^\s]+?)(\%)?$/)
        ?.map((match) => match ?? '');

      if (!matches) {
        return null;
      }

      return matches[1] + matches[2].replace('%', `\\%`) + matches[3];
    })
    .join(' ');
};
