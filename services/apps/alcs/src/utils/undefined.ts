export const filterUndefined = (val: any, fallback: any) =>
  val !== undefined ? val : fallback;
