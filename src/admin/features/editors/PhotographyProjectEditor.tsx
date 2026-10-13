import { useMemo } from 'react';
import type { PhotographyProject } from '../../../shared/content/types';
import { Button } from '../../design-system';
import { adminAssetUrl } from '../../public-assets';
import {
  EditorSection,
  FigureFields,
  HeroFields,
  NumberField,
  ProjectBasicsFields,
  ReorderControls,
} from './EditorFields';
import { moveItem, nextStableId, removeAt, replaceAt, validateProjectDraft } from './editor-model';
import { useProjectDraft } from './local-project-draft';
import { ProjectEditorFrame } from './ProjectEditorFrame';
import { createFigure } from './project-templates';
import { MediaEditorProvider } from '../media/MediaEditorContext';

export function PhotographyProjectEditor({
  initialProject,
  routeIdentity,
  basePublishedRevision,
  draftsEnabled,
  mediaEnabled,
  isNew = false,
}: {
  initialProject: PhotographyProject;
  routeIdentity: string;
  basePublishedRevision: string;
  draftsEnabled: boolean;
  mediaEnabled: boolean;
  isNew?: boolean;
}) {
  const editor = useProjectDraft(initialProject, routeIdentity, {
    basePublishedRevision,
    serverEnabled: draftsEnabled,
  });
  const validation = useMemo(() => validateProjectDraft(editor.project), [editor.project]);
  const patch = (next: Partial<PhotographyProject>) => editor.setProject((project) => ({ ...project, ...next }));
  const figures = editor.project.gallery.figures;

  const addFigure = () => {
    const assetId = nextStableId(figures.map((figure) => figure.image.assetId), 'gallery-frame');
    const nextFigures = [...figures, createFigure(assetId)];
    patch({ gallery: {
      ...editor.project.gallery,
      collectionSize: Math.max(editor.project.gallery.collectionSize, nextFigures.length),
      figures: nextFigures,
    } });
  };

  return (
    <ProjectEditorFrame
      projectType="photography"
      isNew={isNew}
      title={editor.project.title}
      dirty={editor.dirty}
      savedAt={editor.savedAt}
      notice={editor.notice}
      syncStatus={editor.syncStatus}
      mediaCount={editor.mediaIds.length}
      validation={validation}
      onSave={editor.saveNow}
      onReset={editor.reset}
      onReloadServer={editor.reloadServer}
    >
      <MediaEditorProvider value={{
        enabled: mediaEnabled,
        projectType: 'photography',
        projectSlug: editor.project.slug,
        onStaged: editor.onStaged,
      }}>
        <ProjectBasicsFields project={editor.project} onPatch={patch} />
        <HeroFields hero={editor.project.hero} onChange={(hero) => patch({ hero })} />
        <EditorSection
          kicker="Gallery"
          title="Ordered collection"
          actions={<Button onClick={addFigure}>Add gallery image</Button>}
        >
          <NumberField
            label="Full collection size"
            value={editor.project.gallery.collectionSize}
            min={1}
            step={1}
            onChange={(collectionSize) => patch({ gallery: { ...editor.project.gallery, collectionSize } })}
          />
          <p className="editor-field-hint">This may be larger than the published selection, but it cannot be smaller than the number of included frames.</p>
          <div className="editor-collection">
            {figures.map((figure, index) => (
              <div className="editor-card editor-card--photo" key={`${index}-${figure.image.assetId}`}>
                <img className="editor-card__preview" src={adminAssetUrl(figure.image.web.path)} alt="" />
                <div className="editor-card__content">
                  <div className="editor-card-heading">
                    <div><span className="editor-card__index">{String(index + 1).padStart(2, '0')}</span> <strong>{figure.image.alt || 'Untitled gallery image'}</strong></div>
                    <ReorderControls
                      label={`gallery image ${index + 1}`}
                      index={index}
                      length={figures.length}
                      onMove={(direction) => patch({ gallery: { ...editor.project.gallery, figures: moveItem(figures, index, direction) } })}
                      onRemove={() => patch({ gallery: { ...editor.project.gallery, figures: removeAt(figures, index) } })}
                    />
                  </div>
                  <FigureFields
                    label={`Gallery image ${index + 1}`}
                    figure={figure}
                    onChange={(next) => patch({ gallery: { ...editor.project.gallery, figures: replaceAt(figures, index, next) } })}
                  />
                </div>
              </div>
            ))}
          </div>
          {figures.length === 0 && <p className="editor-empty-inline">A photography project needs at least one gallery image.</p>}
        </EditorSection>
      </MediaEditorProvider>
    </ProjectEditorFrame>
  );
}
