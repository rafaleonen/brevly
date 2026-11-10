export type Cursor = { id: string; clicks: number };

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(value: string): {
  error: boolean;
  value?: Cursor;
} {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (typeof parsed?.id !== "string" || typeof parsed?.clicks !== "number") {
      return { error: true };
    }

    return { error: false, value: parsed };
  } catch {
    return { error: true };
  }
}
