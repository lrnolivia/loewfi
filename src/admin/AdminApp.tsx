import { AdminShell } from './app/AdminShell';
import { useCmsBootstrap } from './app/bootstrap';
import { adminHref, useAdminRoute } from './app/router';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { NewProjectPage } from './features/projects/NewProjectPage';
import { ProjectDetailPage } from './features/projects/ProjectDetailPage';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { DesignProjectEditor } from './features/editors/DesignProjectEditor';
import { PhotographyProjectEditor } from './features/editors/PhotographyProjectEditor';
import { createDesignProjectTemplate, createPhotographyProjectTemplate } from './features/editors/project-templates';
import { ActionLink, Button, EmptyState, LoadingState } from './design-system';

const newDesignProject = createDesignProjectTemplate();
const newPhotographyProject = createPhotographyProjectTemplate();

export function AdminApp() {
  const route = useAdminRoute();
  const { state, retry } = useCmsBootstrap();

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') {
    return (
      <main className="admin-startup-error">
        <p className="admin-kicker">CMS unavailable</p>
        <h1>The workspace could not open.</h1>
        <p>{state.message}</p>
        <Button onClick={retry}>Try again</Button>
      </main>
    );
  }

  const { data } = state;
  const editorInfrastructure = {
    basePublishedRevision: data.published.revision,
    draftsEnabled: data.capabilities.features.drafts,
    mediaEnabled: data.capabilities.features.media,
  };
  return (
    <AdminShell route={route} identity={data.identity}>
      {route.name === 'dashboard' && <DashboardPage data={data} />}
      {route.name === 'projects' && <ProjectsPage collection={data.published.collection} />}
      {route.name === 'new-project' && <NewProjectPage />}
      {route.name === 'new-project-editor' && route.projectType === 'design' && (
        <DesignProjectEditor key="new-design" initialProject={newDesignProject} routeIdentity="new:design" isNew {...editorInfrastructure} />
      )}
      {route.name === 'new-project-editor' && route.projectType === 'photography' && (
        <PhotographyProjectEditor key="new-photography" initialProject={newPhotographyProject} routeIdentity="new:photography" isNew {...editorInfrastructure} />
      )}
      {route.name === 'project' && (() => {
        const project = data.published.collection.projects.find((item) => item.slug === route.slug);
        return project ? <ProjectDetailPage project={project} /> : (
          <EmptyState title="That project is not in the collection." action={<ActionLink href={adminHref('/projects')}>Return to projects</ActionLink>}>
            It may have been renamed or removed from the published source.
          </EmptyState>
        );
      })()}
      {route.name === 'project-editor' && (() => {
        const project = data.published.collection.projects.find((item) => item.slug === route.slug);
        if (!project) {
          return (
            <EmptyState title="That project is not in the collection." action={<ActionLink href={adminHref('/projects')}>Return to projects</ActionLink>}>
              A local editor can only start from a project in the published source or a new-project template.
            </EmptyState>
          );
        }
        return project.projectType === 'design'
          ? <DesignProjectEditor key={`design:${project.slug}`} initialProject={project} routeIdentity={`existing:${project.slug}`} {...editorInfrastructure} />
          : <PhotographyProjectEditor key={`photography:${project.slug}`} initialProject={project} routeIdentity={`existing:${project.slug}`} {...editorInfrastructure} />;
      })()}
      {route.name === 'not-found' && (
        <EmptyState title="This CMS page does not exist." action={<ActionLink href={adminHref('/')}>Return to dashboard</ActionLink>}>
          Use the dashboard to find the part of the portfolio you need.
        </EmptyState>
      )}
    </AdminShell>
  );
}
