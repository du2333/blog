export function uniqueOrThrow<T>(array: T[]) {
  if (array.length !== 1)
    throw new Error(`Expected 1 item, got ${array.length}`);
  return array[0];
}
