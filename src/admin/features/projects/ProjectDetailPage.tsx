import type { ProjectDocument } from '../../../shared/content/types';
import { adminHref } from '../../app/router';
import { ActionLink, Badge, PageHeader, Surface } from '../../design-system';
import { projectItemCount, projectItemLabel, richTextToPlainText } from './project-model';
import { adminAssetUrl } from '../../public-assets';

export function ProjectDetailPage({ project }: { project: ProjectDocument }) {
  const isDesign = project.projectType === 'design';
  return (
    <>
      <a className="back-link" href={adminHref('/projects')}>← All projects</a>
      <PageHeader
        kicker={project.eyebrow}
        title={project.title}
        description={richTextToPlainText(project.summary)}
        actions={
          <div className="detail-actions">
            <ActionLink href={`/generated-preview/${project.slug}.html`} target="_blank" variant="secondary">View generated page</ActionLink>
            <ActionLink href={adminHref(`/projects/${project.slug}/edit`)}>Edit project</ActionLink>
          </div>
        }
      />
      <section className="project-detail-grid">
        <Surface className="project-detail-hero">
          <img src={adminAssetUrl(project.hero.image.web.path)} alt={project.hero.image.alt} />
          <div><Badge tone={isDesign ? 'design' : 'photo'}>{project.projectType}</Badge></div>
        </Surface>
        <div className="project-detail-side">
          <Surface className="detail-facts" tone="cream">
            <p className="admin-kicker">Canonical structure</p>
            <dl>
              <div><dt>Slug</dt><dd>{project.slug}</dd></div>
              <div><dt>Track</dt><dd>{project.projectType}</dd></div>
              <div><dt>Structure</dt><dd>{projectItemCount(project)} {projectItemLabel(project)}</dd></div>
              <div><dt>Schema</dt><dd>Version {project.schemaVersion}</dd></div>
            </dl>
          </Surface>
          <Surface className="editor-status" tone="quiet">
            <p className="admin-kicker">Editing status</p>
            <h2>{isDesign ? 'Structured design editor' : 'Photography gallery editor'}</h2>
            <p>Its specialized editor is available with live schema validation and browser-local recovery. Server drafts and publishing stay disconnected.</p>
          </Surface>
        </div>
      </section>
      {isDesign ? <DesignStructure project={project} /> : <GalleryStructure project={project} />}
    </>
  );
}

function DesignStructure({ project }: { project: Extract<ProjectDocument, { projectType: 'design' }> }) {
  return (
    <Surface className="structure-panel">
      <div className="section-heading"><div><p className="admin-kicker">Document outline</p><h2>Content blocks</h2></div><Badge>{project.body.length} blocks</Badge></div>
      <ol className="structure-list">
        {project.body.map((block, index) => (
          <li key={block.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{block.type}</strong><small>{block.id}</small></li>
        ))}
      </ol>
    </Surface>
  );
}

function GalleryStructure({ project }: { project: Extract<ProjectDocument, { projectType: 'photography' }> }) {
  return (
    <Surface className="structure-panel">
      <div className="section-heading"><div><p className="admin-kicker">Gallery structure</p><h2>Included frames</h2></div><Badge>{project.gallery.figures.length} loaded / {project.gallery.collectionSize} total</Badge></div>
      <div className="mini-gallery">
        {project.gallery.figures.map((figure) => (
          <figure key={figure.image.assetId}>
            <img src={adminAssetUrl(figure.image.web.path)} alt={figure.image.alt} />
            <figcaption>{figure.image.alt}</figcaption>
          </figure>
        ))}
      </div>
    </Surface>
  );
}
