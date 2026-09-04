import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StagedMediaAsset } from '../../../shared/api/contracts';
import type { ProjectDocument, ProjectType } from '../../../shared/content/types';
import { parseProjectDocument } from '../../../shared/content/validation';
import { ApiError, deleteProjectDraft, fetchProjectDraft, saveProjectDraft } from '../../api/client';

const STORAGE_PREFIX = 'loewfi-cms:local-project:';
const ENVELOPE_VERSION = 2;
const SERVER_AUTOSAVE_DELAY_MS = 15_000;
const LOCAL_AUTOSAVE_DELAY_MS = 250;

type StoredDraft = {
  version: 1 | typeof ENVELOPE_VERSION;
  savedAt: string;
  project: ProjectDocument;
  mediaIds?: string[];
  serverRevision?: string;
};

export type LoadedProjectDraft<T extends ProjectDocument> = {
  project: T;
  mediaIds: string[];
  serverRevision?: string;
  source: 'initial' | 'local';
  savedAt?: string;
  recoveryNotice?: string;
};

export type DraftSyncStatus =
  | 'loading'
  | 'local-only'
  | 'idle'
  | 'saving'
  | 'saved'
  | 'invalid'
  | 'error'
  | 'conflict';

export function projectDraftKey(routeIdentity: string): string {
  return `${STORAGE_PREFIX}${routeIdentity}`;
}

export function readProjectDraft<T extends ProjectDocument>(
  storage: Pick<Storage, 'getItem'>,
  key: string,
  initial: T,
): LoadedProjectDraft<T> {
  const raw = storage.getItem(key);
  if (!raw) return { project: cloneProject(initial), mediaIds: [], source: 'initial' };

  try {
    const envelope = JSON.parse(raw) as Partial<StoredDraft>;
    if (
      ![1, ENVELOPE_VERSION].includes(envelope.version ?? 0)
      || typeof envelope.savedAt !== 'string'
      || !isCompatibleProject(envelope.project, initial.projectType)
      || (envelope.mediaIds !== undefined && (!Array.isArray(envelope.mediaIds) || !envelope.mediaIds.every((id) => typeof id === 'string')))
    ) {
      throw new Error('The saved data does not match this editor.');
    }
    return {
      project: cloneProject(envelope.project as T),
      mediaIds: envelope.mediaIds ?? [],
      ...(typeof envelope.serverRevision === 'string' ? { serverRevision: envelope.serverRevision } : {}),
      source: 'local',
      savedAt: envelope.savedAt,
    };
  } catch {
    return {
      project: cloneProject(initial),
      mediaIds: [],
      source: 'initial',
      recoveryNotice: 'A damaged local working copy was ignored. The source version is open instead.',
    };
  }
}

export function writeProjectDraft(
  storage: Pick<Storage, 'setItem'>,
  key: string,
  project: ProjectDocument,
  savedAt = new Date().toISOString(),
  options: { mediaIds?: string[]; serverRevision?: string } = {},
): string {
  const envelope: StoredDraft = {
    version: ENVELOPE_VERSION,
    savedAt,
    project,
    mediaIds: options.mediaIds ?? [],
    ...(options.serverRevision ? { serverRevision: options.serverRevision } : {}),
  };
  storage.setItem(key, JSON.stringify(envelope));
  return savedAt;
}

export function clearProjectDraft(storage: Pick<Storage, 'removeItem'>, key: string): void {
  storage.removeItem(key);
}

export function useProjectDraft<T extends ProjectDocument>(
  initial: T,
  routeIdentity: string,
  options: { basePublishedRevision: string; serverEnabled: boolean },
) {
  const key = useMemo(() => projectDraftKey(routeIdentity), [routeIdentity]);
  const [loaded] = useState(() => readProjectDraft(window.localStorage, key, initial));
  const [project, setProject] = useState<T>(loaded.project);
  const [mediaIds, setMediaIds] = useState<string[]>(loaded.mediaIds);
  const [serverRevision, setServerRevision] = useState<string | undefined>(loaded.serverRevision);
  const [serverSnapshot, setServerSnapshot] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | undefined>(loaded.savedAt);
  const [notice, setNotice] = useState<string | undefined>(loaded.recoveryNotice);
  const [syncStatus, setSyncStatus] = useState<DraftSyncStatus>(options.serverEnabled ? 'loading' : 'local-only');
  const saving = useRef(false);
  const revisionRef = useRef(serverRevision);
  const projectRef = useRef(project);
  const mediaIdsRef = useRef(mediaIds);

  projectRef.current = project;
  mediaIdsRef.current = mediaIds;
  revisionRef.current = serverRevision;

  const currentSnapshot = serializeDraft(project, mediaIds);
  const dirty = serverSnapshot === null ? loaded.source === 'local' : currentSnapshot !== serverSnapshot;
  const valid = isCanonicalProject(project);

  const cacheLocally = useCallback((
    nextProject: T,
    nextMediaIds: string[],
    revision = revisionRef.current,
    timestamp = new Date().toISOString(),
  ) => {
    writeProjectDraft(window.localStorage, key, nextProject, timestamp, {
      mediaIds: nextMediaIds,
      ...(revision ? { serverRevision: revision } : {}),
    });
    setSavedAt(timestamp);
    return timestamp;
  }, [key]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      cacheLocally(project, mediaIds);
      if (!options.serverEnabled) {
        setSyncStatus('local-only');
        setNotice('Changes are being recovered in this browser. Attach draft storage to sync them to the server.');
      } else if (!valid) {
        setSyncStatus('invalid');
        setNotice('This in-progress version is safe in this browser. Fix the validation issue before it syncs to the server.');
      }
    }, LOCAL_AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [cacheLocally, mediaIds, options.serverEnabled, project, valid]);

  const loadServerDraft = useCallback(async (preferServer: boolean) => {
    if (!options.serverEnabled) return;
    setSyncStatus('loading');
    try {
      const record = await fetchProjectDraft(routeIdentity);
      if (!record) {
        setServerSnapshot(serializeDraft(initial, []));
        setServerRevision(undefined);
        setSyncStatus(loaded.source === 'local' ? 'idle' : 'saved');
        setNotice(loaded.source === 'local' ? 'A browser-local working copy is ready to sync.' : 'No server draft exists yet. Changes will autosave after you pause.');
        return;
      }
      const localIsNewer = !preferServer && loaded.savedAt && Date.parse(loaded.savedAt) > Date.parse(record.updatedAt);
      setServerRevision(record.revision);
      setServerSnapshot(serializeDraft(record.document, record.mediaIds));
      if (!localIsNewer) {
        setProject(cloneProject(record.document as T));
        setMediaIds(record.mediaIds);
        cacheLocally(record.document as T, record.mediaIds, record.revision, record.updatedAt);
      }
      setSavedAt(localIsNewer ? loaded.savedAt : record.updatedAt);
      setSyncStatus(localIsNewer ? 'idle' : 'saved');
      setNotice(localIsNewer ? 'A newer browser-local copy is open and will sync after you pause.' : `Server draft loaded from ${record.updatedBy}.`);
    } catch (error) {
      setSyncStatus('error');
      setNotice(error instanceof Error ? `${error.message} Browser-local recovery remains active.` : 'Draft sync failed. Browser-local recovery remains active.');
    }
  }, [cacheLocally, initial, loaded.savedAt, loaded.source, options.serverEnabled, routeIdentity]);

  useEffect(() => { void loadServerDraft(false); }, [loadServerDraft]);

  const syncNow = useCallback(async () => {
    const nextProject = projectRef.current;
    const nextMediaIds = mediaIdsRef.current;
    cacheLocally(nextProject, nextMediaIds);
    if (!options.serverEnabled) {
      setSyncStatus('local-only');
      return;
    }
    if (!isCanonicalProject(nextProject)) {
      setSyncStatus('invalid');
      setNotice('Saved in this browser. Fix the validation issue before server sync.');
      return;
    }
    if (saving.current) return;
    saving.current = true;
    setSyncStatus('saving');
    const submittedSnapshot = serializeDraft(nextProject, nextMediaIds);
    try {
      const record = await saveProjectDraft(routeIdentity, {
        document: nextProject,
        expectedRevision: revisionRef.current ?? null,
        basePublishedRevision: options.basePublishedRevision,
        mediaIds: nextMediaIds,
      });
      setServerRevision(record.revision);
      setServerSnapshot(submittedSnapshot);
      cacheLocally(nextProject, nextMediaIds, record.revision, record.updatedAt);
      setSyncStatus('saved');
      setNotice('Draft synced to the authenticated server store. Nothing was published.');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'conflict') {
        setSyncStatus('conflict');
        setNotice('A newer server draft exists. Load it before continuing to avoid overwriting work.');
      } else {
        setSyncStatus('error');
        setNotice(error instanceof Error ? `${error.message} Browser-local recovery remains active.` : 'Draft sync failed. Browser-local recovery remains active.');
      }
    } finally {
      saving.current = false;
    }
  }, [cacheLocally, options.basePublishedRevision, options.serverEnabled, routeIdentity]);

  useEffect(() => {
    if (!options.serverEnabled || syncStatus === 'loading' || syncStatus === 'saving' || syncStatus === 'conflict' || !dirty || !valid) return;
    const timer = window.setTimeout(() => { void syncNow(); }, SERVER_AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, options.serverEnabled, syncNow, syncStatus, valid]);

  const reset = async () => {
    if (options.serverEnabled && revisionRef.current) {
      try {
        await deleteProjectDraft(routeIdentity, revisionRef.current);
      } catch (error) {
        setSyncStatus(error instanceof ApiError && error.code === 'conflict' ? 'conflict' : 'error');
        setNotice(error instanceof Error ? error.message : 'The server draft could not be discarded.');
        return;
      }
    }
    clearProjectDraft(window.localStorage, key);
    const fresh = cloneProject(initial);
    setProject(fresh);
    setMediaIds([]);
    setServerRevision(undefined);
    setServerSnapshot(serializeDraft(fresh, []));
    setSavedAt(undefined);
    setSyncStatus(options.serverEnabled ? 'saved' : 'local-only');
    setNotice(options.serverEnabled ? 'Draft discarded. The published source version is open.' : 'Local changes cleared. The source version is open.');
  };

  const onStaged = (assets: StagedMediaAsset[]) => {
    setMediaIds((current) => [...new Set([...current, ...assets.map((asset) => asset.stagingId)])]);
  };

  return {
    project,
    setProject,
    dirty,
    savedAt,
    notice,
    syncStatus,
    mediaIds,
    saveNow: syncNow,
    reset,
    reloadServer: () => loadServerDraft(true),
    onStaged,
  };
}

function isCanonicalProject(project: ProjectDocument): boolean {
  try { parseProjectDocument(project); return true; }
  catch { return false; }
}

function serializeDraft(project: ProjectDocument, mediaIds: string[]): string {
  return JSON.stringify({ project, mediaIds: [...mediaIds].sort() });
}

function isCompatibleProject(value: unknown, projectType: ProjectType): value is ProjectDocument {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const project = value as Record<string, unknown>;
  if (
    project.schemaVersion !== 1
    || project.kind !== 'project'
    || project.projectType !== projectType
    || typeof project.id !== 'string'
    || typeof project.slug !== 'string'
    || typeof project.title !== 'string'
    || typeof project.eyebrow !== 'string'
    || !Array.isArray(project.summary)
    || !project.hero
    || typeof project.hero !== 'object'
  ) return false;
  return projectType === 'design'
    ? Array.isArray(project.metadata) && Array.isArray(project.body)
    : !!project.gallery && typeof project.gallery === 'object'
      && Array.isArray((project.gallery as Record<string, unknown>).figures);
}

function cloneProject<T extends ProjectDocument>(project: T): T {
  return JSON.parse(JSON.stringify(project)) as T;
}
