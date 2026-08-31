import type { CmsIdentity } from '../../../../src/shared/api/contracts';

export type CmsKvNamespace = {
  get(key: string): Promise<string | null>;
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  getWithMetadata<Metadata>(key: string, type: 'arrayBuffer'): Promise<{ value: ArrayBuffer | null; metadata: Metadata | null }>;
  put(key: string, value: string | ArrayBuffer, options?: { expirationTtl?: number; metadata?: unknown }): Promise<void>;
  delete(key: string): Promise<void>;
};

export type CmsApiData = {
  identity?: CmsIdentity;
  requestId?: string;
};

export type CmsApiEnv = {
  CF_PAGES_COMMIT_SHA?: string;
  CMS_LOCAL_ADMIN_EMAIL?: string;
  CMS_DRAFTS?: CmsKvNamespace;
  CMS_MEDIA?: CmsKvNamespace;
};

export type CmsApiContext = {
  request: Request;
  data: CmsApiData;
  env: CmsApiEnv;
  next(): Promise<Response>;
};

export type CmsRouteContext = Omit<CmsApiContext, 'next'>;

export type CmsRouteHandler = (context: CmsRouteContext) => Response | Promise<Response>;
