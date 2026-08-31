import { useMemo, useState } from 'react';
import type {
  ComparisonBlock,
  ContentBlock,
  DesignProject,
  Figure,
  FigureStripBlock,
  MetadataItem,
  RichText,
} from '../../../shared/content/types';
import { Badge, Button } from '../../design-system';
import {
  EditorSection,
  FigureFields,
  HeroFields,
  ImageAssetFields,
  ProjectBasicsFields,
  ReorderControls,
  RichTextEditor,
  SelectField,
  TextField,
} from './EditorFields';
import { moveItem, nextStableId, removeAt, replaceAt, validateProjectDraft } from './editor-model';
import { useLocalProjectDraft } from './local-project-draft';
import { ProjectEditorFrame } from './ProjectEditorFrame';
import {
  createContentBlock,
  createFigure,
  type ContentBlockType,
} from './project-templates';

const blockOptions: Array<readonly [ContentBlockType, string]> = [
  ['headline', 'Headline'],
  ['paragraph', 'Paragraph'],
  ['heading', 'Section heading'],
  ['figure', 'Single figure'],
  ['figure-pair', 'Figure pair'],
  ['comparison', 'Before / after comparison'],
  ['figure-strip', 'Figure strip'],
  ['image-break', 'Image break'],
];

export function DesignProjectEditor({
  initialProject,
  routeIdentity,
  isNew = false,
}: {
  initialProject: DesignProject;
  routeIdentity: string;
  isNew?: boolean;
}) {
  const editor = useLocalProjectDraft(initialProject, routeIdentity);
  const validation = useMemo(() => validateProjectDraft(editor.project), [editor.project]);
  const patch = (next: Partial<DesignProject>) => editor.setProject((project) => ({ ...project, ...next }));

  return (
    <ProjectEditorFrame
      projectType="design"
      isNew={isNew}
      title={editor.project.title}
      dirty={editor.dirty}
      savedAt={editor.savedAt}
      notice={editor.notice}
      validation={validation}
      onSaveLocal={editor.saveLocal}
      onReset={editor.reset}
    >
      <ProjectBasicsFields project={editor.project} onPatch={patch} />
      <HeroFields hero={editor.project.hero} onChange={(hero) => patch({ hero })} />
      <MetadataEditor metadata={editor.project.metadata} onChange={(metadata) => patch({ metadata })} />
      <DesignBlocksEditor blocks={editor.project.body} onChange={(body) => patch({ body })} />
    </ProjectEditorFrame>
  );
}

function MetadataEditor({ metadata, onChange }: { metadata: MetadataItem[]; onChange: (metadata: MetadataItem[]) => void }) {
  const addMetadata = () => {
    const id = nextStableId(metadata.map((item) => item.id), 'credit');
    onChange([...metadata, { id, label: 'Credit', value: [{ type: 'text', text: 'Add a value.' }] }]);
  };
  return (
    <EditorSection kicker="Project facts" title="Flexible metadata" actions={<Button variant="secondary" onClick={addMetadata}>Add metadata</Button>}>
      <div className="editor-collection">
        {metadata.map((item, index) => (
          <div className="editor-card" key={`${index}-${item.id}`}>
            <div className="editor-card-heading">
              <div><span className="editor-card__index">{String(index + 1).padStart(2, '0')}</span> <strong>{item.label || 'Untitled metadata'}</strong></div>
              <ReorderControls
                label={`metadata ${index + 1}`}
                index={index}
                length={metadata.length}
                onMove={(direction) => onChange(moveItem(metadata, index, direction))}
                onRemove={() => onChange(removeAt(metadata, index))}
              />
            </div>
            <div className="editor-field-grid editor-field-grid--two">
              <TextField label="Metadata ID" value={item.id} onChange={(id) => onChange(replaceAt(metadata, index, { ...item, id }))} />
              <TextField label="Label" value={item.label} onChange={(label) => onChange(replaceAt(metadata, index, { ...item, label }))} />
            </div>
            <RichTextEditor label={`${item.label || 'Metadata'} value`} value={item.value} onChange={(value) => onChange(replaceAt(metadata, index, { ...item, value }))} />
          </div>
        ))}
      </div>
      {metadata.length === 0 && <p className="editor-field-hint">Metadata is optional. Add only facts that belong beside this project.</p>}
    </EditorSection>
  );
}

function DesignBlocksEditor({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
  const [newType, setNewType] = useState<ContentBlockType>('paragraph');
  const addBlock = () => {
    const id = nextStableId(blocks.map((block) => block.id), newType);
    onChange([...blocks, createContentBlock(newType, id)]);
  };
  return (
    <EditorSection kicker="Visual story" title="Ordered content blocks">
      <div className="editor-add-row">
        <SelectField label="Block type" value={newType} options={blockOptions} onChange={(value) => setNewType(value as ContentBlockType)} />
        <Button onClick={addBlock}>Add block</Button>
      </div>
      <div className="editor-collection">
        {blocks.map((block, index) => (
          <div className="editor-card" key={`${index}-${block.id}`}>
            <div className="editor-card-heading">
              <div><span className="editor-card__index">{String(index + 1).padStart(2, '0')}</span> <Badge tone="design">{block.type}</Badge></div>
              <ReorderControls
                label={`block ${index + 1} ${block.type}`}
                index={index}
                length={blocks.length}
                onMove={(direction) => onChange(moveItem(blocks, index, direction))}
                onRemove={() => onChange(removeAt(blocks, index))}
              />
            </div>
            <TextField label="Stable block ID" value={block.id} onChange={(id) => onChange(replaceAt(blocks, index, { ...block, id }))} />
            <BlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, index, next))} />
          </div>
        ))}
      </div>
      {blocks.length === 0 && <p className="editor-empty-inline">A design project needs at least one content block.</p>}
    </EditorSection>
  );
}

function BlockFields({ block, onChange }: { block: ContentBlock; onChange: (block: ContentBlock) => void }) {
  if (block.type === 'headline') {
    return <RichTextEditor label="Headline" value={block.content} onChange={(content) => onChange({ ...block, content })} />;
  }
  if (block.type === 'paragraph') {
    return (
      <>
        <SelectField
          label="Paragraph treatment"
          value={block.treatment ?? 'standard'}
          options={[["standard", "Standard"], ["lede", "Lede"]]}
          onChange={(treatment) => onChange({ ...block, treatment: treatment as 'standard' | 'lede' })}
        />
        <RichTextEditor label="Paragraph copy" value={block.content} onChange={(content) => onChange({ ...block, content })} />
      </>
    );
  }
  if (block.type === 'heading') {
    return <TextField label="Section heading" value={block.text} onChange={(text) => onChange({ ...block, text })} />;
  }
  if (block.type === 'figure') {
    return (
      <>
        <SelectField
          label="Figure layout"
          value={block.layout}
          options={[["full", "Full"], ["narrow", "Narrow"], ["centered", "Centered"]]}
          onChange={(layout) => onChange({ ...block, layout: layout as typeof block.layout })}
        />
        <FigureFields label="Figure" figure={block.figure} onChange={(figure) => onChange({ ...block, figure })} />
      </>
    );
  }
  if (block.type === 'figure-pair') {
    return (
      <>
        <FigureFields label="Left figure" figure={block.figures[0]} onChange={(figure) => onChange({ ...block, figures: [figure, block.figures[1]] })} />
        <FigureFields label="Right figure" figure={block.figures[1]} onChange={(figure) => onChange({ ...block, figures: [block.figures[0], figure] })} />
      </>
    );
  }
  if (block.type === 'comparison') return <ComparisonFields block={block} onChange={onChange} />;
  if (block.type === 'figure-strip') return <FigureStripFields block={block} onChange={onChange} />;
  return <ImageAssetFields label="Break image" image={block.image} onChange={(image) => onChange({ ...block, image })} />;
}

function ComparisonFields({ block, onChange }: { block: ComparisonBlock; onChange: (block: ComparisonBlock) => void }) {
  const updateLabeledFigure = (side: 'before' | 'after', figure: Figure) => {
    const current = block[side];
    onChange({ ...block, [side]: { ...figure, label: current.label } });
  };
  return (
    <>
      <div className="editor-field-grid editor-field-grid--two">
        <TextField label="Before label" value={block.before.label} onChange={(label) => onChange({ ...block, before: { ...block.before, label } })} />
        <TextField label="After label" value={block.after.label} onChange={(label) => onChange({ ...block, after: { ...block.after, label } })} />
      </div>
      <FigureFields label="Before figure" figure={block.before} onChange={(figure) => updateLabeledFigure('before', figure)} />
      <FigureFields label="After figure" figure={block.after} onChange={(figure) => updateLabeledFigure('after', figure)} />
      <OptionalRichText
        label="Comparison caption"
        value={block.caption}
        onChange={(caption) => onChange(caption ? { ...block, caption } : removeBlockCaption(block))}
      />
    </>
  );
}

function FigureStripFields({ block, onChange }: { block: FigureStripBlock; onChange: (block: FigureStripBlock) => void }) {
  const addFigure = () => {
    const assetId = nextStableId(block.figures.map((figure) => figure.image.assetId), `${block.id}-frame`);
    onChange({ ...block, figures: [...block.figures, createFigure(assetId)] });
  };
  return (
    <>
      {block.figures.map((figure, index) => (
        <div className="editor-card" key={`${index}-${figure.image.assetId}`}>
          <div className="editor-card-heading">
            <strong>Strip figure {index + 1}</strong>
            <ReorderControls
              label={`strip figure ${index + 1}`}
              index={index}
              length={block.figures.length}
              onMove={(direction) => onChange({ ...block, figures: moveItem(block.figures, index, direction) })}
              onRemove={() => onChange({ ...block, figures: removeAt(block.figures, index) })}
            />
          </div>
          <FigureFields label={`Figure ${index + 1}`} figure={figure} onChange={(next) => onChange({ ...block, figures: replaceAt(block.figures, index, next) })} />
        </div>
      ))}
      <Button variant="secondary" onClick={addFigure}>Add strip figure</Button>
    </>
  );
}

function OptionalRichText({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: RichText;
  onChange: (value?: RichText) => void;
}) {
  return (
    <>
      <label className="editor-toggle-row">
        <input type="checkbox" checked={value !== undefined} onChange={(event) => onChange(event.target.checked ? [{ type: 'text', text: 'Add a caption.' }] : undefined)} />
        Include {label.toLowerCase()}
      </label>
      {value && <RichTextEditor label={label} value={value} onChange={onChange} />}
    </>
  );
}

function removeBlockCaption(block: ComparisonBlock): ComparisonBlock {
  const next = { ...block };
  delete next.caption;
  return next;
}
