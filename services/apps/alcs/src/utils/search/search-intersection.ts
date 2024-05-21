import { intersectSets } from '../set-helper';

export const processSearchPromises = async (
  promises: Promise<{ fileNumber: string }[]>[],
) => {
  const queryResults = await Promise.all(promises);

  const allIds: Set<string>[] = [];
  for (const result of queryResults) {
    const fileNumbers = new Set<string>();
    result.forEach((currentValue) => {
      fileNumbers.add(currentValue.fileNumber);
    });
    allIds.push(fileNumbers);
  }

  return intersectSets(allIds);
};
