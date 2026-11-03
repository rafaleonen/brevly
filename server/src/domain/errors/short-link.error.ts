import { DomainError } from "@/core/error";

export class InvalidUrlError extends DomainError {
  readonly code = "INVALID_URL";

  constructor(readonly url: string) {
    super(`The URL "${url}" is invalid. Only http and https URLs are allowed.`);
  }
}

export class CodeAlreadyExistsError extends DomainError {
  readonly code = "CODE_ALREADY_EXISTS";

  constructor(code: string) {
    super(`Code "${code}" already exists`);
  }
}

export class CodeGenerationError extends DomainError {
  readonly code = "CODE_GENERATION_ERROR";
  constructor() {
    super("Could not generate a unique short link code");
  }
}

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(resource: string) {
    super(`${resource} not found.`);
  }
}
