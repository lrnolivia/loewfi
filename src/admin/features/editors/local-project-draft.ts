import { useMemo, useState } from 'react';
import type { ProjectDocument, ProjectType } from '../../../shared/content/types';

const STORAGE_PREFIX = 'loewfi-cms:local-project:';
const ENVELOPE_VERSION = 1;

type StoredDraft = {
  version: typeof ENVELOPE_VERSION;
  savedAt: string;
  project: ProjectDocument;
};

export type LoadedProjectDraft<T extends ProjectDocument> = {
  project: T;
  source: 'initial' | 'local';
  savedAt?: string;
  recoveryNotice?: string;
};

export function projectDraftKey(routeIdentity: string): string {
  return `${STORAGE_PREFIX}${routeIdentity}`;
}

export function readProjectDraft<T extends ProjectDocument>(
  storage: Pick<Storage, 'getItem'>,
  key: string,
  initial: T,
): LoadedProjectDraft<T> {
  const raw = storage.getItem(key);
  if (!raw) return { project: cloneProject(initial), source: 'initial' };

  try {
    const envelope = JSON.parse(raw) as Partial<StoredDraft>;
    if (
      envelope.version !== ENVELOPE_VERSION
      || typeof envelope.savedAt !== 'string'
      || !isCompatibleProject(envelope.project, initial.projectType)
    ) {
      throw new Error('The saved data does not match this editor.');
    }
    return {
      project: cloneProject(envelope.project as T),
      source: 'local',
      savedAt: envelope.savedAt,
    };
  } catch {
    return {
      project: cloneProject(initial),
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
): string {
  const envelope: StoredDraft = { version: ENVELOPE_VERSION, savedAt, project };
  storage.setItem(key, JSON.stringify(envelope));
  return savedAt;
}

export function clearProjectDraft(storage: Pick<Storage, 'removeItem'>, key: string): void {
  storage.removeItem(key);
}

export function useLocalProjectDraft<T extends ProjectDocument>(initial: T, routeIdentity: string) {
  const key = useMemo(() => projectDraftKey(routeIdentity), [routeIdentity]);
  const [loaded] = useState(() => readProjectDraft(window.localStorage, key, initial));
  const [project, setProject] = useState<T>(loaded.project);
  const [savedAt, setSavedAt] = useState<string | undefined>(loaded.savedAt);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(loaded.project));
  const [notice, setNotice] = useState<string | undefined>(loaded.recoveryNotice);
  const dirty = JSON.stringify(project) !== savedSnapshot;

  const saveLocal = () => {
    const nextSavedAt = writeProjectDraft(window.localStorage, key, project);
    setSavedAt(nextSavedAt);
    setSavedSnapshot(JSON.stringify(project));
    setNotice('Working copy saved in this browser. Nothing was sent to the server.');
  };

  const reset = () => {
    clearProjectDraft(window.localStorage, key);
    const fresh = cloneProject(initial);
    setProject(fresh);
    setSavedAt(undefined);
    setSavedSnapshot(JSON.stringify(fresh));
    setNotice('Local changes cleared. The source version is open.');
  };

  return {
    project,
    setProject,
    dirty,
    savedAt,
    notice,
    source: loaded.source,
    saveLocal,
    reset,
  };
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
