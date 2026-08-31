import type { CmsBootstrapData } from '../../app/bootstrap';
import { adminHref } from '../../app/router';
import { ActionLink, Badge, PageHeader, Surface } from '../../design-system';
import { collectionAssetCount, orderedProjects, projectItemCount, projectItemLabel } from '../projects/project-model';
import { adminAssetUrl } from '../../public-assets';

export function DashboardPage({ data }: { data: CmsBootstrapData }) {
  const { collection, revision } = data.published;
  const projects = orderedProjects(collection);
  const stats = [
    { value: collection.projects.length, label: 'Published projects' },
    { value: collection.pages.length, label: 'Site pages' },
    { value: collectionAssetCount(collection), label: 'Referenced media' },
  ];

  return (
    <>
      <PageHeader
        kicker="Portfolio control panel"
        title="Everything in its place."
        description="A clear view of the portfolio now, with editing tools arriving track by track."
        actions={<ActionLink href={adminHref('/projects/new')}>New project</ActionLink>}
      />

      <section className="metric-grid" aria-label="Portfolio totals">
        {stats.map((stat) => (
          <Surface className="metric-card" key={stat.label}>
            <strong>{stat.value.toString().padStart(2, '0')}</strong>
            <span>{stat.label}</span>
          </Surface>
        ))}
      </section>

      <div className="dashboard-grid">
        <Surface className="dashboard-projects">
          <div className="section-heading">
            <div><p className="admin-kicker">Current collection</p><h2>Projects</h2></div>
            <ActionLink href={adminHref('/projects')} variant="ghost">View all</ActionLink>
          </div>
          <div className="compact-project-list">
            {projects.map((project) => (
              <a href={adminHref(`/projects/${project.slug}`)} className="compact-project" key={project.id}>
                <img src={adminAssetUrl(project.hero.image.web.path)} alt="" />
                <span className="compact-project__title"><strong>{project.title}</strong><small>{project.eyebrow}</small></span>
                <Badge tone={project.projectType === 'design' ? 'design' : 'photo'}>{project.projectType}</Badge>
                <span className="compact-project__count">{projectItemCount(project)} {projectItemLabel(project)}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </Surface>

        <div className="dashboard-side">
          <Surface className="readiness-card" tone="cream">
            <p className="admin-kicker">System readiness</p>
            <h2>Clean foundation, honest switches.</h2>
            <ul>
              <li><span>Content API</span><Badge tone="good">Connected</Badge></li>
              <li><span>Validation</span><Badge tone="good">Active</Badge></li>
              <li><span>Drafts</span><Badge>Milestone 10</Badge></li>
              <li><span>Publishing</span><Badge>Milestone 12</Badge></li>
            </ul>
          </Surface>
          <Surface className="revision-card" tone="quiet">
            <p className="admin-kicker">Published source</p>
            <strong>{shortRevision(revision)}</strong>
            <span>{data.published.source === 'bundled-repository' ? 'Bundled repository snapshot' : data.published.source}</span>
          </Surface>
        </div>
      </div>
    </>
  );
}

function shortRevision(revision: string): string {
  return revision === 'local-working-tree' ? revision : revision.slice(0, 10);
}
