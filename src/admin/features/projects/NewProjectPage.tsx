import { adminHref } from '../../app/router';
import { ActionLink, Badge, PageHeader, Surface } from '../../design-system';

export function NewProjectPage() {
  return (
    <>
      <a className="back-link" href={adminHref('/projects')}>← All projects</a>
      <PageHeader
        kicker="New project"
        title="Choose the shape of the work."
        description="Each track gets an editor designed for its real content instead of forcing everything into one generic form."
      />
      <section className="track-choice-grid">
        <Surface className="track-choice track-choice--design">
          <Badge tone="design">Design / editorial</Badge>
          <div><span className="track-choice__number">01</span><h2>Build a visual story.</h2></div>
          <p>Metadata, written sections, image layouts, comparisons, strips, and pull images in a structured block editor.</p>
          <ActionLink href={adminHref('/projects/new/design')}>Start a design project</ActionLink>
        </Surface>
        <Surface className="track-choice track-choice--photo">
          <Badge tone="photo">Photography</Badge>
          <div><span className="track-choice__number">02</span><h2>Shape a gallery.</h2></div>
          <p>Project details, hero art direction, gallery images, captions, alt text, and deliberate ordering.</p>
          <ActionLink href={adminHref('/projects/new/photography')}>Start a photo project</ActionLink>
        </Surface>
      </section>
      <p className="honest-note">Each starter opens as a recoverable browser-local working copy. It does not create a server draft or publish a project.</p>
    </>
  );
}
