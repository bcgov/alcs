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

export function truncate(text: string, limit: number): string {
  return text.length > limit ? text.substring(0, limit) + '...' : text;
}

export function isTruncated(text: string, limit: number): boolean {
  return text.length > limit;
}
