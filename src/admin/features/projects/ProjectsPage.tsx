import { useMemo, useState } from 'react';
import type { ContentCollection } from '../../../shared/content/types';
import { adminHref } from '../../app/router';
import { ActionLink, Badge, EmptyState, PageHeader } from '../../design-system';
import { filterProjects, orderedProjects, projectItemCount, projectItemLabel, type ProjectFilter } from './project-model';
import { adminAssetUrl } from '../../public-assets';

const filters: Array<{ value: ProjectFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'design', label: 'Design' },
  { value: 'photography', label: 'Photo' },
];

export function ProjectsPage({ collection }: { collection: ContentCollection }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const projects = useMemo(
    () => filterProjects(orderedProjects(collection), query, filter),
    [collection, query, filter],
  );

  return (
    <>
      <PageHeader
        kicker="Project management"
        title="The work, organized."
        description="Browse the canonical collection, inspect its structure, and enter the right editor for each track."
        actions={<ActionLink href={adminHref('/projects/new')}>New project</ActionLink>}
      />
      <div className="project-toolbar">
        <label className="search-field">
          <span className="sr-only">Search projects</span>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" />
        </label>
        <div className="filter-switch" role="group" aria-label="Filter by project track">
          {filters.map((item) => (
            <button
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              key={item.value}
            >{item.label}</button>
          ))}
        </div>
        <span className="project-result-count" aria-live="polite">{projects.length} shown</span>
      </div>
      {projects.length ? (
        <section className="project-grid" aria-label="Projects">
          {projects.map((project) => (
            <a className="project-card" href={adminHref(`/projects/${project.slug}`)} key={project.id}>
              <div className="project-card__image">
                <img src={adminAssetUrl(project.hero.image.web.path)} alt="" />
                <Badge tone={project.projectType === 'design' ? 'design' : 'photo'}>{project.projectType}</Badge>
              </div>
              <div className="project-card__body">
                <p>{project.eyebrow}</p>
                <h2>{project.title}</h2>
                <span>{projectItemCount(project)} {projectItemLabel(project)}</span>
              </div>
              <span className="project-card__arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </section>
      ) : (
        <EmptyState title="No projects match this view.">
          Try another search or switch the track filter.
        </EmptyState>
      )}
    </>
  );
}
