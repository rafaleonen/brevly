import { DomainError } from "@/core/error";

export class InvalidFileTypeError extends DomainError {
  readonly code = "INVALID_FILE_TYPE";

  constructor(fileType: string) {
    super(`This file type "${fileType}" is invalid.`);
  }
}

export class ExportFailedError extends DomainError {
  readonly code = "EXPORT_FAILED";

  constructor(readonly cause: unknown) {
    super("Could not export the short links. Try again later.");
  }
}
