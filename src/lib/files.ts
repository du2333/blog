export function getFileExtension(fileName: string): string | undefined {
  return fileName.split(".").pop();
}

export function generateKey(fileName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const uuid = crypto.randomUUID();
  const extension = getFileExtension(fileName);

  return `${year}/${month}/${day}/${uuid}.${extension}`;
}
