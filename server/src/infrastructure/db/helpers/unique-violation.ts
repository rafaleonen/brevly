export function uniqueViolation(error: unknown): string | null {
  const source = error instanceof Error && error.cause ? error.cause : error;
  const pgError = source as { code?: string; constraint?: string };
  return pgError?.code === "23505" ? pgError.constraint ?? null : null;
}
