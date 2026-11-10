import { DomainError } from "@/core/error";

export class InvalidUrlError extends DomainError {
  readonly code = "INVALID_URL";

  constructor(url: string) {
    super(`The URL "${url}" is invalid. Only http and https URLs are allowed.`);
  }
}

export class SlugAlreadyExistsError extends DomainError {
  readonly code = "SLUG_ALREADY_EXISTS";

  constructor(slug: string) {
    super(`Slug "${slug}" already exists`);
  }
}

export class InvalidSlugError extends DomainError {
  readonly code = "INVALID_SLUG";

  constructor(slug: string) {
    super(`Slug "${slug}" is invalid`);
  }
}

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(resource: string) {
    super(`${resource} not found.`);
  }
}

export class InvalidCursor extends DomainError {
  readonly code = "INVALID_CURSOR";

  constructor(cursor: string) {
    super(`Cursor ${cursor} is invalid.`);
  }
}
