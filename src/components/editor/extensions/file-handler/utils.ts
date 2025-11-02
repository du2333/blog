export type FileError = {
  file: File | string;
  reason: "type" | "size" | "invalidBase64" | "base64NotAllowed";
};

export type FileValidationOptions = {
  allowedMimeTypes: string[];
  maxFileSize?: number;
  allowBase64: boolean;
};

type FileInput = File | { src: string | File; alt?: string; title?: string };

const isUrl = (
  text: string,
  options: { requireHostname: boolean; allowBase64?: boolean } = {
    requireHostname: false,
  }
): boolean => {
  if (text.includes("\n")) return false;

  try {
    const url = new URL(text);
    const blockedProtocols = [
      "javascript:",
      "file:",
      "vbscript:",
      ...(options.allowBase64 ? [] : ["data:"]),
    ];

    if (blockedProtocols.includes(url.protocol)) return false;
    if (options.allowBase64 && url.protocol === "data:")
      return /^data:image\/[a-z]+;base64,/.test(text);
    if (url.hostname) return true;

    return (
      url.protocol !== "" &&
      (url.pathname.startsWith("//") || url.pathname.startsWith("http")) &&
      !options.requireHostname
    );
  } catch {
    return false;
  }
};

const sanitizeUrl = (
  url: string | null | undefined,
  options: { allowBase64?: boolean } = {}
): string | undefined => {
  if (!url) return undefined;

  if (options.allowBase64 && url.startsWith("data:image")) {
    return isUrl(url, { requireHostname: false, allowBase64: true })
      ? url
      : undefined;
  }

  return isUrl(url, {
    requireHostname: false,
    allowBase64: options.allowBase64,
  }) || /^(\/|#|mailto:|sms:|fax:|tel:)/.test(url)
    ? url
    : `https://${url}`;
};

const validateFileOrBase64 = <T extends FileInput>(
  input: File | string,
  options: FileValidationOptions,
  originalFile: T,
  validFiles: T[],
  errors: FileError[]
): void => {
  const { isValidType, isValidSize } = checkTypeAndSize(input, options);

  if (isValidType && isValidSize) {
    validFiles.push(originalFile);
  } else {
    if (!isValidType) errors.push({ file: input, reason: "type" });
    if (!isValidSize) errors.push({ file: input, reason: "size" });
  }
};

const checkTypeAndSize = (
  input: File | string,
  { allowedMimeTypes, maxFileSize }: FileValidationOptions
): { isValidType: boolean; isValidSize: boolean } => {
  const mimeType = input instanceof File ? input.type : base64MimeType(input);
  const base64Part = input instanceof File ? null : input.split(",")[1];
  const size =
    input instanceof File
      ? input.size
      : base64Part
      ? atob(base64Part).length
      : 0;

  const isValidType =
    allowedMimeTypes.length === 0 ||
    allowedMimeTypes.includes(mimeType) ||
    allowedMimeTypes.includes(`${mimeType.split("/")[0]}/*`);

  const isValidSize = !maxFileSize || size <= maxFileSize;

  return { isValidType, isValidSize };
};

const base64MimeType = (encoded: string): string => {
  const result = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  return result && result.length > 1 && result[1] ? result[1] : "unknown";
};

const isBase64 = (str: string): boolean => {
  if (str.startsWith("data:")) {
    const matches = str.match(/^data:[^;]+;base64,(.+)$/);
    if (matches && matches[1]) {
      str = matches[1];
    } else {
      return false;
    }
  }

  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
};

export const filterFiles = <T extends FileInput>(
  files: T[],
  options: FileValidationOptions
): [T[], FileError[]] => {
  const validFiles: T[] = [];
  const errors: FileError[] = [];

  files.forEach((file) => {
    const actualFile = "src" in file ? file.src : file;

    if (actualFile instanceof File) {
      validateFileOrBase64(actualFile, options, file, validFiles, errors);
    } else if (typeof actualFile === "string") {
      if (isBase64(actualFile)) {
        if (options.allowBase64) {
          validateFileOrBase64(actualFile, options, file, validFiles, errors);
        } else {
          errors.push({ file: actualFile, reason: "base64NotAllowed" });
        }
      } else {
        if (!sanitizeUrl(actualFile, { allowBase64: options.allowBase64 })) {
          errors.push({ file: actualFile, reason: "invalidBase64" });
        } else {
          validFiles.push(file);
        }
      }
    }
  });

  return [validFiles, errors];
};
