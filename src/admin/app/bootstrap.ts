import { useCallback, useEffect, useState } from 'react';
import type { CmsCapabilities, PublishedContentSnapshot } from '../../shared/api/contracts';
import type { WhoAmI } from '../../shared/api/whoami';
import { fetchCapabilities, fetchPublishedContent, fetchWhoAmI } from '../api/client';

export type CmsBootstrapData = {
  identity: WhoAmI;
  capabilities: CmsCapabilities;
  published: PublishedContentSnapshot;
};

export type CmsBootstrapState =
  | { status: 'loading' }
  | { status: 'ready'; data: CmsBootstrapData }
  | { status: 'error'; message: string };

export function useCmsBootstrap() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<CmsBootstrapState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    Promise.all([
      fetchWhoAmI({ signal: controller.signal }),
      fetchCapabilities({ signal: controller.signal }),
      fetchPublishedContent({ signal: controller.signal }),
    ]).then(([identity, capabilities, published]) => {
      setState({ status: 'ready', data: { identity, capabilities, published } });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'The CMS could not start.',
      });
    });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { state, retry };
}
