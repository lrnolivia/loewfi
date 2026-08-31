import type { CmsIdentity } from './contracts';
import { isRecord } from './contracts';

export type WhoAmI = CmsIdentity;

export function parseWhoAmI(value: unknown): WhoAmI {
  if (!isRecord(value)) throw new Error('Invalid CMS identity response.');
  if (
    typeof value.email !== 'string' ||
    value.email.trim() === '' ||
    !['cloudflare-access', 'local-development'].includes(String(value.authentication)) ||
    typeof value.accessJwtPresent !== 'boolean' ||
    typeof value.timestamp !== 'string' ||
    Number.isNaN(Date.parse(value.timestamp))
  ) {
    throw new Error('Invalid CMS identity response.');
  }

  return {
    email: value.email,
    authentication: value.authentication as WhoAmI['authentication'],
    accessJwtPresent: value.accessJwtPresent,
    timestamp: value.timestamp,
  };
}
