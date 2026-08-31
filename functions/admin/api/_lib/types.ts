import type { CmsIdentity } from '../../../../src/shared/api/contracts';

export type CmsApiData = {
  identity?: CmsIdentity;
  requestId?: string;
};

export type CmsApiEnv = {
  CF_PAGES_COMMIT_SHA?: string;
  CMS_LOCAL_ADMIN_EMAIL?: string;
};

export type CmsApiContext = {
  request: Request;
  data: CmsApiData;
  env: CmsApiEnv;
  next(): Promise<Response>;
};

export type CmsRouteContext = Omit<CmsApiContext, 'next'>;

export type CmsRouteHandler = (context: CmsRouteContext) => Response | Promise<Response>;
