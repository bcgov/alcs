export const intersectSets = (sets: Set<string>[]): Set<string> => {
  // If there are no sets, return an empty set
  if (sets.length === 0) {
    return new Set<string>();
  }

  // Start with the first set
  let intersection = new Set<string>(sets[0]);

  // Iterate over the remaining sets
  for (let i = 1; i < sets.length; i++) {
    intersection = new Set<string>(
      [...intersection].filter((item) => sets[i].has(item)),
    );
  }

  return intersection;
};
