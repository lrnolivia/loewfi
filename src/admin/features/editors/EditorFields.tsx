import type { ReactNode } from 'react';
import type {
  Figure,
  Hero,
  ImageAsset,
  ProjectDocument,
  RichText,
  TextMark,
} from '../../../shared/content/types';
import { Button } from '../../design-system';
import { MediaPreparationPanel } from '../media/MediaPreparationPanel';
import { moveItem, removeAt, replaceAt } from './editor-model';

type BaseProjectPatch = Partial<Pick<ProjectDocument, 'id' | 'slug' | 'title' | 'eyebrow' | 'summary' | 'hero'>>;

export function ProjectBasicsFields({
  project,
  onPatch,
}: {
  project: ProjectDocument;
  onPatch: (patch: BaseProjectPatch) => void;
}) {
  return (
    <EditorSection kicker="Project identity" title="Name and introduction">
      <div className="editor-field-grid editor-field-grid--two">
        <TextField label="Project title" value={project.title} onChange={(title) => onPatch({ title })} />
        <TextField label="Eyebrow" value={project.eyebrow} onChange={(eyebrow) => onPatch({ eyebrow })} />
        <TextField
          label="URL slug"
          value={project.slug}
          hint="Lowercase kebab-case. Changing it does not publish or redirect the old URL."
          onChange={(slug) => onPatch({ slug })}
        />
        <TextField
          label="Stable project ID"
          value={project.id}
          hint="For projects this must match the URL slug."
          onChange={(id) => onPatch({ id })}
        />
      </div>
      <RichTextEditor label="Project summary" value={project.summary} onChange={(summary) => onPatch({ summary })} />
    </EditorSection>
  );
}

export function HeroFields({ hero, onChange }: { hero: Hero; onChange: (hero: Hero) => void }) {
  return (
    <EditorSection kicker="Hero" title="Lead image and art direction">
      <ImageAssetFields
        label="Hero image"
        image={hero.image}
        onChange={(image) => onChange({ ...hero, image })}
      />
      <div className="editor-field-grid editor-field-grid--four">
        <NumberField
          label="Focal X"
          value={hero.focalPoint.x}
          min={0}
          max={1}
          step={0.05}
          onChange={(x) => onChange({ ...hero, focalPoint: { ...hero.focalPoint, x } })}
        />
        <NumberField
          label="Focal Y"
          value={hero.focalPoint.y}
          min={0}
          max={1}
          step={0.05}
          onChange={(y) => onChange({ ...hero, focalPoint: { ...hero.focalPoint, y } })}
        />
        <SelectField
          label="Tone"
          value={hero.tone}
          options={[
            ['natural', 'Natural'],
            ['muted-photo', 'Muted photo'],
            ['softened-artwork', 'Softened artwork'],
          ]}
          onChange={(tone) => onChange({ ...hero, tone: tone as Hero['tone'] })}
        />
        <SelectField
          label="Attachment"
          value={hero.attachment}
          options={[["scroll", "Scroll"], ["fixed", "Fixed"]]}
          onChange={(attachment) => onChange({ ...hero, attachment: attachment as Hero['attachment'] })}
        />
      </div>
    </EditorSection>
  );
}

export function RichTextEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RichText;
  onChange: (value: RichText) => void;
}) {
  const addNode = () => onChange([...value, { type: 'text', text: 'New text' }]);
  return (
    <fieldset className="editor-nested-group rich-text-editor">
      <legend>{label}</legend>
      <p className="editor-field-hint">Inline text stays structured, including links, emphasis, and strong marks.</p>
      <div className="editor-stack">
        {value.map((node, index) => (
          <div className="rich-text-node" key={`${index}-${node.type}`}>
            <div className="rich-text-node__heading">
              <strong>Inline {index + 1}</strong>
              <ReorderControls
                label={`${label} inline ${index + 1}`}
                index={index}
                length={value.length}
                onMove={(direction) => onChange(moveItem(value, index, direction))}
                onRemove={() => onChange(removeAt(value, index))}
              />
            </div>
            <div className="editor-field-grid editor-field-grid--two">
              <SelectField
                label="Inline type"
                value={node.type}
                options={[["text", "Text"], ["link", "Link"]]}
                onChange={(type) => {
                  const next = type === 'link'
                    ? { type: 'link' as const, text: node.text, href: node.type === 'link' ? node.href : 'https://', ...(node.marks ? { marks: node.marks } : {}) }
                    : { type: 'text' as const, text: node.text, ...(node.marks ? { marks: node.marks } : {}) };
                  onChange(replaceAt(value, index, next));
                }}
              />
              <TextField
                label="Text"
                value={node.text}
                onChange={(text) => onChange(replaceAt(value, index, { ...node, text }))}
              />
              {node.type === 'link' && (
                <TextField
                  label="Link destination"
                  value={node.href}
                  hint="Use https://, mailto:, tel:, or a root-relative /path."
                  onChange={(href) => onChange(replaceAt(value, index, { ...node, href }))}
                />
              )}
              <div className="editor-mark-field">
                <span>Marks</span>
                <label><input type="checkbox" checked={node.marks?.includes('emphasis') ?? false} onChange={() => onChange(replaceAt(value, index, toggleMark(node, 'emphasis')))} /> Emphasis</label>
                <label><input type="checkbox" checked={node.marks?.includes('strong') ?? false} onChange={() => onChange(replaceAt(value, index, toggleMark(node, 'strong')))} /> Strong</label>
              </div>
            </div>
          </div>
        ))}
      </div>
      {value.length === 0 && <p className="editor-empty-inline">Add at least one inline node to make this text valid.</p>}
      <Button variant="secondary" onClick={addNode}>Add inline text</Button>
    </fieldset>
  );
}

export function ImageAssetFields({
  label,
  image,
  onChange,
}: {
  label: string;
  image: ImageAsset;
  onChange: (image: ImageAsset) => void;
}) {
  const fullEnabled = image.full !== undefined;
  return (
    <fieldset className="editor-nested-group image-asset-editor">
      <legend>{label}</legend>
      <div className="editor-field-grid editor-field-grid--two">
        <TextField label="Asset ID" value={image.assetId} onChange={(assetId) => onChange({ ...image, assetId })} />
        <TextField label="Alt text" value={image.alt} onChange={(alt) => onChange({ ...image, alt })} />
        <TextField label="Web image path" value={image.web.path} hint="Repository-relative image path." onChange={(path) => onChange({ ...image, web: { ...image.web, path } })} />
        <div className="editor-field-grid editor-field-grid--two editor-field-grid--nested">
          <OptionalNumberField label="Web width" value={image.web.width} onChange={(width) => onChange({ ...image, web: patchOptionalNumber(image.web, 'width', width) })} />
          <OptionalNumberField label="Web height" value={image.web.height} onChange={(height) => onChange({ ...image, web: patchOptionalNumber(image.web, 'height', height) })} />
        </div>
      </div>
      <label className="editor-toggle-row">
        <input
          type="checkbox"
          checked={fullEnabled}
          onChange={(event) => onChange(event.target.checked
            ? { ...image, full: { path: image.web.path, ...(image.web.width ? { width: image.web.width } : {}), ...(image.web.height ? { height: image.web.height } : {}) } }
            : removeFullVariant(image))}
        />
        Include a full-size variant
      </label>
      {image.full && (
        <div className="editor-field-grid editor-field-grid--two">
          <TextField label="Full image path" value={image.full.path} onChange={(path) => onChange({ ...image, full: { ...image.full!, path } })} />
          <div className="editor-field-grid editor-field-grid--two editor-field-grid--nested">
            <OptionalNumberField label="Full width" value={image.full.width} onChange={(width) => onChange({ ...image, full: patchOptionalNumber(image.full!, 'width', width) })} />
            <OptionalNumberField label="Full height" value={image.full.height} onChange={(height) => onChange({ ...image, full: patchOptionalNumber(image.full!, 'height', height) })} />
          </div>
        </div>
      )}
      <MediaPreparationPanel label={label} image={image} onApply={onChange} />
    </fieldset>
  );
}

export function FigureFields({
  label,
  figure,
  onChange,
}: {
  label: string;
  figure: Figure;
  onChange: (figure: Figure) => void;
}) {
  return (
    <fieldset className="editor-nested-group figure-editor">
      <legend>{label}</legend>
      <ImageAssetFields label="Image" image={figure.image} onChange={(image) => onChange({ ...figure, image })} />
      <label className="editor-toggle-row">
        <input
          type="checkbox"
          checked={figure.caption !== undefined}
          onChange={(event) => onChange(event.target.checked
            ? { ...figure, caption: [{ type: 'text', text: 'Add a caption.' }] }
            : removeCaption(figure))}
        />
        Include a caption
      </label>
      {figure.caption && <RichTextEditor label="Caption" value={figure.caption} onChange={(caption) => onChange({ ...figure, caption })} />}
    </fieldset>
  );
}

export function EditorSection({
  kicker,
  title,
  actions,
  children,
}: {
  kicker: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="material-surface editor-section">
      <div className="editor-section__heading">
        <div><p className="admin-kicker">{kicker}</p><h2>{title}</h2></div>
        {actions}
      </div>
      <div className="editor-stack">{children}</div>
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
}) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {multiline
        ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
        : <input value={value} onChange={(event) => onChange(event.target.value)} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function OptionalNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <input type="number" min={1} step={1} value={value ?? ''} onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))} />
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<readonly [string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

export function ReorderControls({
  label,
  index,
  length,
  onMove,
  onRemove,
}: {
  label: string;
  index: number;
  length: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="editor-row-actions">
      <button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)}>↑</button>
      <button type="button" aria-label={`Move ${label} down`} disabled={index === length - 1} onClick={() => onMove(1)}>↓</button>
      <button type="button" className="is-danger" aria-label={`Remove ${label}`} onClick={onRemove}>×</button>
    </div>
  );
}

function toggleMark<T extends RichText[number]>(node: T, mark: TextMark): T {
  const marks = node.marks ?? [];
  const nextMarks = marks.includes(mark) ? marks.filter((item) => item !== mark) : [...marks, mark];
  const next = { ...node } as T & { marks?: TextMark[] };
  if (nextMarks.length) next.marks = nextMarks;
  else delete next.marks;
  return next;
}

function patchOptionalNumber<T extends { path: string; width?: number; height?: number }>(
  variant: T,
  key: 'width' | 'height',
  value: number | undefined,
): T {
  const next = { ...variant };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return next;
}

function removeFullVariant(image: ImageAsset): ImageAsset {
  const next = { ...image };
  delete next.full;
  return next;
}

function removeCaption(figure: Figure): Figure {
  const next = { ...figure };
  delete next.caption;
  return next;
}
