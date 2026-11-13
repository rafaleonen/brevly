import { makeLeft, makeRight, type Either } from "@/core/either";
import { InvalidFileTypeError } from "../errors/storage.error";

interface StorageKeyProps {
  value: string;
}

const ALLOWED_EXTENSIONS: Record<string, string> = {
  "text/csv": "csv",
  "application/csv": "csv",
};

export class StorageKey {
  private constructor(private readonly props: StorageKeyProps) {
    this.props = props;
  }

  static create(
    fileName: string,
    fileType: string
  ): Either<InvalidFileTypeError, StorageKey> {
    const ext = ALLOWED_EXTENSIONS[fileType];

    if (!ext) {
      return makeLeft(new InvalidFileTypeError(fileType));
    }

    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");

    const baseName = fileName
      .replace(/\.csv$/i, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return makeRight(
      new StorageKey({ value: `${timestamp}-${baseName}.${ext}` })
    );
  }

  static restore(value: string): StorageKey {
    return new StorageKey({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
