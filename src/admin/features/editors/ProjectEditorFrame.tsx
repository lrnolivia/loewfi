import type { ReactNode } from 'react';
import type { ProjectType } from '../../../shared/content/types';
import { adminHref } from '../../app/router';
import { Badge, Button, PageHeader, Surface } from '../../design-system';
import type { ProjectDraftValidation } from './editor-model';
import './editor.css';

export function ProjectEditorFrame({
  projectType,
  isNew,
  title,
  dirty,
  savedAt,
  notice,
  validation,
  onSaveLocal,
  onReset,
  children,
}: {
  projectType: ProjectType;
  isNew: boolean;
  title: string;
  dirty: boolean;
  savedAt?: string;
  notice?: string;
  validation: ProjectDraftValidation;
  onSaveLocal: () => void;
  onReset: () => void;
  children: ReactNode;
}) {
  const trackLabel = projectType === 'design' ? 'Design project editor' : 'Photography gallery editor';
  return (
    <>
      <a className="back-link" href={adminHref('/projects')}>← All projects</a>
      <PageHeader
        kicker={`${isNew ? 'New' : 'Edit'} · ${trackLabel}`}
        title={title}
        description="This is a recoverable browser-local working copy. Server drafts, media uploads, preview, and publishing remain deliberately disconnected."
        actions={
          <div className="detail-actions">
            <Button
              variant="secondary"
              onClick={() => {
                if (window.confirm('Clear this browser-local working copy and return to the source version?')) onReset();
              }}
            >Reset local copy</Button>
            <Button onClick={onSaveLocal}>{savedAt && !dirty ? 'Saved locally' : 'Save working copy'}</Button>
          </div>
        }
      />
      <div className="editor-workspace">
        <form className="editor-form" onSubmit={(event) => event.preventDefault()}>{children}</form>
        <aside className="editor-sidebar" aria-label="Working copy status">
          <Surface className="editor-validation" tone={validation.valid ? 'cream' : 'quiet'}>
            <div className="editor-status-line">
              <Badge tone={validation.valid ? 'good' : 'warning'}>{validation.valid ? 'Schema valid' : 'Needs attention'}</Badge>
              <span>{dirty ? 'Unsaved changes' : savedAt ? 'Local copy saved' : 'Source loaded'}</span>
            </div>
            <h2>{validation.valid ? 'Ready for a future draft.' : 'Keep shaping the document.'}</h2>
            {validation.valid ? (
              <p>The canonical project parser accepts this working copy. Saving here still does not publish it.</p>
            ) : (
              <ul aria-live="polite">
                {validation.issues.map((issue) => <li key={`${issue.path}-${issue.message}`}><code>{issue.path}</code> {issue.message}</li>)}
              </ul>
            )}
          </Surface>
          <Surface className="editor-local-status" tone="quiet">
            <p className="admin-kicker">Local recovery</p>
            <strong>{savedAt ? `Saved ${formatSavedAt(savedAt)}` : 'Not saved in this browser yet'}</strong>
            <p>{notice ?? 'Use Save working copy before leaving or reloading. This data stays in this browser only.'}</p>
          </Surface>
          <Surface className="editor-boundary-note" tone="quiet">
            <p className="admin-kicker">Milestone boundary</p>
            <p>No API mutation, asset upload, draft sync, preview generation, Git commit, or deployment is triggered here.</p>
          </Surface>
        </aside>
      </div>
    </>
  );
}

function formatSavedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'locally';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(date);
}
