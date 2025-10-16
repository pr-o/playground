const hasOwn = Object.prototype.hasOwnProperty;

const isObjectLike = (value: unknown): value is Record<PropertyKey, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const shallow = (objA: unknown, objB: unknown) => {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (!isObjectLike(objA) || !isObjectLike(objB)) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i += 1) {
    const key = keysA[i];
    if (!hasOwn.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
};
