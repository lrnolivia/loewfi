import type { ReactNode } from 'react';
import type { ProjectType } from '../../../shared/content/types';
import { adminHref } from '../../app/router';
import { Badge, Button, PageHeader, Surface } from '../../design-system';
import type { ProjectDraftValidation } from './editor-model';
import type { DraftSyncStatus } from './local-project-draft';
import './editor.css';

export function ProjectEditorFrame({
  projectType,
  isNew,
  title,
  dirty,
  savedAt,
  notice,
  syncStatus,
  mediaCount,
  validation,
  onSave,
  onReset,
  onReloadServer,
  children,
}: {
  projectType: ProjectType;
  isNew: boolean;
  title: string;
  dirty: boolean;
  savedAt?: string;
  notice?: string;
  syncStatus: DraftSyncStatus;
  mediaCount: number;
  validation: ProjectDraftValidation;
  onSave: () => void | Promise<void>;
  onReset: () => void | Promise<void>;
  onReloadServer: () => void | Promise<void>;
  children: ReactNode;
}) {
  const trackLabel = projectType === 'design' ? 'Design project editor' : 'Photography gallery editor';
  return (
    <>
      <a className="back-link" href={adminHref('/projects')}>← All projects</a>
      <PageHeader
        kicker={`${isNew ? 'New' : 'Edit'} · ${trackLabel}`}
        title={title}
        description="Valid work autosaves to authenticated draft storage, with immediate browser recovery while you edit. Staged media stays private; nothing publishes from this screen."
        actions={
          <div className="detail-actions">
            <Button
              variant="secondary"
              onClick={() => {
                if (window.confirm('Discard the browser recovery copy and server draft, then return to the published source?')) void onReset();
              }}
            >Discard draft</Button>
            <Button onClick={() => void onSave()} disabled={syncStatus === 'loading' || syncStatus === 'saving'}>
              {syncStatus === 'saving' ? 'Saving…' : !dirty && syncStatus === 'saved' ? 'Draft saved' : 'Save now'}
            </Button>
          </div>
        }
      />
      <div className="editor-workspace">
        <form className="editor-form" onSubmit={(event) => event.preventDefault()}>{children}</form>
        <aside className="editor-sidebar" aria-label="Working copy status">
          <Surface className="editor-validation" tone={validation.valid ? 'cream' : 'quiet'}>
            <div className="editor-status-line">
              <Badge tone={validation.valid ? 'good' : 'warning'}>{validation.valid ? 'Schema valid' : 'Needs attention'}</Badge>
              <span>{syncStatusLabel(syncStatus, dirty)}</span>
            </div>
            <h2>{validation.valid ? 'Canonical draft ready.' : 'Keep shaping the document.'}</h2>
            {validation.valid ? (
              <p>The canonical project parser accepts this working copy. Server saves remain separate from publishing.</p>
            ) : (
              <ul aria-live="polite">
                {validation.issues.map((issue) => <li key={`${issue.path}-${issue.message}`}><code>{issue.path}</code> {issue.message}</li>)}
              </ul>
            )}
          </Surface>
          <Surface className="editor-local-status" tone="quiet">
            <p className="admin-kicker">Draft recovery</p>
            <strong>{savedAt ? `Recovery checkpoint ${formatSavedAt(savedAt)}` : 'Preparing the first recovery checkpoint'}</strong>
            <p>{notice ?? 'Changes are cached in this browser immediately and valid drafts sync after you pause.'}</p>
            {syncStatus === 'conflict' && (
              <Button
                variant="secondary"
                onClick={() => {
                  if (window.confirm('Replace this browser copy with the newer server draft?')) void onReloadServer();
                }}
              >Load server version</Button>
            )}
          </Surface>
          <Surface className="editor-boundary-note" tone="quiet">
            <p className="admin-kicker">Milestone boundary</p>
            <p>{mediaCount} staged media {mediaCount === 1 ? 'file' : 'files'} attached. Preview, Git publishing, and deployment remain disconnected.</p>
          </Surface>
        </aside>
      </div>
    </>
  );
}

function syncStatusLabel(status: DraftSyncStatus, dirty: boolean): string {
  if (status === 'loading') return 'Loading draft';
  if (status === 'saving') return 'Syncing draft';
  if (status === 'saved') return dirty ? 'Autosave pending' : 'Server draft saved';
  if (status === 'invalid') return 'Local recovery only';
  if (status === 'local-only') return 'Browser recovery only';
  if (status === 'conflict') return 'Sync conflict';
  if (status === 'error') return 'Sync unavailable';
  return dirty ? 'Autosave pending' : 'Draft current';
}

function formatSavedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'locally';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(date);
}
