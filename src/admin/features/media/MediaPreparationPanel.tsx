import { useEffect, useMemo, useState } from 'react';
import { CMS_MAX_MEDIA_BYTES, type StagedMediaAsset } from '../../../shared/api/contracts';
import type { ImageAsset } from '../../../shared/content/types';
import { stageMedia } from '../../api/client';
import { Button } from '../../design-system';
import { useMediaEditor } from './MediaEditorContext';
import {
  formatBytes,
  normalizedAssetId,
  prepareImage,
  type CropAspect,
  type PreparedImage,
} from './prepare-image';

export function MediaPreparationPanel({
  label,
  image,
  onApply,
}: {
  label: string;
  image: ImageAsset;
  onApply: (image: ImageAsset) => void;
}) {
  const editor = useMediaEditor();
  const [file, setFile] = useState<File | null>(null);
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [assetId, setAssetId] = useState(() => editor ? normalizedAssetId(editor.projectSlug, image.assetId) : image.assetId);
  const [maxWidth, setMaxWidth] = useState(2400);
  const [quality, setQuality] = useState(0.82);
  const [cropAspect, setCropAspect] = useState<CropAspect>('original');
  const [focusX, setFocusX] = useState(0.5);
  const [focusY, setFocusY] = useState(0.5);
  const [keepFull, setKeepFull] = useState(true);
  const [status, setStatus] = useState<'idle' | 'preparing' | 'uploading' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editor) setAssetId(normalizedAssetId(editor.projectSlug, image.assetId));
  }, [editor?.projectSlug, image.assetId]);

  const sourceUrl = useObjectUrl(file);
  const webUrl = useObjectUrl(prepared?.web ?? null);
  const projectSlugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(editor?.projectSlug ?? '');
  const fullTooLarge = (file?.size ?? 0) > CMS_MAX_MEDIA_BYTES;
  const savings = prepared && file ? Math.round((1 - prepared.web.size / file.size) * 100) : null;

  const chooseFile = async (nextFile: File | null) => {
    setFile(nextFile);
    setPrepared(null);
    setMessage('');
    if (!nextFile) return;
    await runPreparation(nextFile);
  };

  const runPreparation = async (source = file) => {
    if (!source) return;
    setStatus('preparing');
    setMessage('');
    try {
      const result = await prepareImage(source, { maxWidth, quality, cropAspect, focusX, focusY });
      if (result.web.size > CMS_MAX_MEDIA_BYTES) throw new Error('The optimized web image is still over the 10 MB staging limit.');
      setPrepared(result);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'The image could not be prepared.');
    }
  };

  const upload = async () => {
    if (!editor || !prepared || !file) return;
    setStatus('uploading');
    setMessage('');
    try {
      const web = await stageMedia({
        blob: prepared.web,
        projectType: editor.projectType,
        projectSlug: editor.projectSlug,
        assetId,
        variant: 'web',
        width: prepared.webWidth,
        height: prepared.webHeight,
      });
      let full: StagedMediaAsset | undefined;
      if (keepFull && !fullTooLarge) {
        full = await stageMedia({
          blob: file,
          projectType: editor.projectType,
          projectSlug: editor.projectSlug,
          assetId,
          variant: 'full',
          width: prepared.sourceWidth,
          height: prepared.sourceHeight,
        });
      }
      editor.onStaged(full ? [web, full] : [web]);
      onApply({
        assetId,
        alt: image.alt,
        web: { path: web.targetPath, width: web.width, height: web.height },
        ...(full ? { full: { path: full.targetPath, width: full.width, height: full.height } } : {}),
      });
      setStatus('ready');
      setMessage(`Staged ${full ? 'web and full-size files' : 'the optimized web file'} for this draft.`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'The prepared image could not be staged.');
    }
  };

  if (!editor) return null;
  return (
    <details className="media-preparation-panel">
      <summary>{editor.enabled ? `Prepare or replace ${label.toLowerCase()}` : 'Media staging unavailable'}</summary>
      {!editor.enabled ? (
        <p className="editor-field-hint">Attach the CMS_MEDIA Cloudflare binding to stage files. Repository paths remain editable manually.</p>
      ) : (
        <div className="media-preparation-panel__body">
          <label
            className="media-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void chooseFile(event.dataTransfer.files[0] ?? null);
            }}
          >
            <span>{file ? file.name : 'Choose or drop a JPEG, PNG, or WebP'}</span>
            <small>The browser prepares the web derivative before any upload.</small>
            <input aria-label={`Choose ${label} file`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void chooseFile(event.target.files?.[0] ?? null)} />
          </label>
          {file && (
            <>
              <div className="media-control-grid">
                <label><span>Asset ID</span><input value={assetId} onChange={(event) => setAssetId(event.target.value)} /></label>
                <label><span>Web max width</span><input type="number" min="320" max="6000" step="10" value={maxWidth} onChange={(event) => setMaxWidth(Number(event.target.value))} /></label>
                <label><span>WebP quality</span><input type="range" min="0.45" max="0.95" step="0.01" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /><small>{Math.round(quality * 100)}%</small></label>
                <label><span>Crop</span><select value={cropAspect} onChange={(event) => setCropAspect(event.target.value as CropAspect)}><option value="original">Original</option><option value="square">1:1 square</option><option value="portrait">4:5 portrait</option><option value="landscape">16:9 landscape</option></select></label>
                {cropAspect !== 'original' && <label><span>Horizontal focus</span><input type="range" min="0" max="1" step="0.01" value={focusX} onChange={(event) => setFocusX(Number(event.target.value))} /></label>}
                {cropAspect !== 'original' && <label><span>Vertical focus</span><input type="range" min="0" max="1" step="0.01" value={focusY} onChange={(event) => setFocusY(Number(event.target.value))} /></label>}
              </div>
              <label className="editor-toggle-row"><input type="checkbox" checked={keepFull && !fullTooLarge} disabled={fullTooLarge} onChange={(event) => setKeepFull(event.target.checked)} /> Stage the full-size original too</label>
              {fullTooLarge && <p className="media-warning">The original is over 10 MB. Stage the optimized web file here and add the full-size source later through GitHub Desktop.</p>}
              <div className="media-action-row">
                <Button variant="secondary" onClick={() => void runPreparation()} disabled={status === 'preparing' || status === 'uploading'}>{status === 'preparing' ? 'Preparing…' : 'Prepare preview'}</Button>
                <Button onClick={() => void upload()} disabled={!prepared || status === 'preparing' || status === 'uploading' || !projectSlugValid || !assetId.startsWith(`${editor.projectSlug}-`)}>{status === 'uploading' ? 'Staging…' : 'Stage for draft'}</Button>
              </div>
              {!projectSlugValid && <p className="media-warning">Fix the project slug before staging media.</p>}
              {projectSlugValid && !assetId.startsWith(`${editor.projectSlug}-`) && <p className="media-warning">The asset ID must begin with {editor.projectSlug}-.</p>}
              {prepared && (
                <div className="media-comparison">
                  <figure>{sourceUrl && <img src={sourceUrl} alt="Original upload preview" />}<figcaption>Original · {prepared.sourceWidth}×{prepared.sourceHeight} · {formatBytes(file.size)}</figcaption></figure>
                  <figure>{webUrl && <img src={webUrl} alt="Optimized web preview" />}<figcaption>WebP · {prepared.webWidth}×{prepared.webHeight} · {formatBytes(prepared.web.size)}{savings !== null ? ` · ${savings}% smaller` : ''}</figcaption></figure>
                </div>
              )}
              {message && <p className={status === 'error' ? 'media-warning' : 'media-success'} aria-live="polite">{message}</p>}
            </>
          )}
        </div>
      )}
    </details>
  );
}

function useObjectUrl(value: Blob | null): string | null {
  const url = useMemo(() => value ? URL.createObjectURL(value) : null, [value]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}
