import { parseWhoAmI, type WhoAmI } from '../../shared/api/whoami';

type RequestOptions = {
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchWhoAmI(options: RequestOptions = {}): Promise<WhoAmI> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher('/admin/api/whoami', {
    headers: { accept: 'application/json' },
    signal: options.signal,
  });

  if (!response.ok) {
    throw new ApiError('The identity endpoint could not be reached.', response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError('The identity endpoint returned invalid JSON.', response.status);
  }

  try {
    return parseWhoAmI(body);
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'The identity response was invalid.',
      response.status,
    );
  }
}
