export type WhoAmI = {
  ok: true;
  email: string | null;
  accessJwtPresent: boolean;
  timestamp: string;
};

export function parseWhoAmI(value: unknown): WhoAmI {
  if (!isRecord(value)) throw new Error('Invalid CMS identity response.');

  const validEmail = value.email === null || typeof value.email === 'string';
  if (
    value.ok !== true ||
    !validEmail ||
    typeof value.accessJwtPresent !== 'boolean' ||
    typeof value.timestamp !== 'string' ||
    Number.isNaN(Date.parse(value.timestamp))
  ) {
    throw new Error('Invalid CMS identity response.');
  }

  return {
    ok: true,
    email: value.email as string | null,
    accessJwtPresent: value.accessJwtPresent,
    timestamp: value.timestamp,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
