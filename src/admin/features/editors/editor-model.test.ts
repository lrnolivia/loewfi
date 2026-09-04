import { describe, expect, it } from 'vitest';
import { parseProjectDocument } from '../../../shared/content/validation';
import { moveItem, nextStableId, removeAt, replaceAt, validateProjectDraft } from './editor-model';
import { clearProjectDraft, projectDraftKey, readProjectDraft, writeProjectDraft } from './local-project-draft';
import {
  createContentBlock,
  createDesignProjectTemplate,
  createPhotographyProjectTemplate,
  type ContentBlockType,
} from './project-templates';

describe('project editor model', () => {
  it('creates valid specialized project templates', () => {
    expect(parseProjectDocument(createDesignProjectTemplate()).projectType).toBe('design');
    expect(parseProjectDocument(createPhotographyProjectTemplate()).projectType).toBe('photography');
  });

  it('creates a valid default for every design block type', () => {
    const project = createDesignProjectTemplate();
    const types: ContentBlockType[] = [
      'headline', 'paragraph', 'heading', 'figure', 'figure-pair', 'comparison', 'figure-strip', 'image-break',
    ];
    project.body = types.map((type, index) => createContentBlock(type, `block-${index + 1}`));
    expect(parseProjectDocument(project)).toEqual(project);
  });

  it('supports immutable list editing and stable ids', () => {
    expect(replaceAt(['a', 'b'], 1, 'c')).toEqual(['a', 'c']);
    expect(removeAt(['a', 'b'], 0)).toEqual(['b']);
    expect(moveItem(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
    expect(nextStableId(['figure', 'figure-2'], 'figure')).toBe('figure-3');
  });

  it('reports canonical validation issues without losing the working shape', () => {
    const project = createDesignProjectTemplate();
    project.slug = 'Not Safe';
    const result = validateProjectDraft(project);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues[0].path).toBe('$.slug');
  });
});

describe('local project recovery', () => {
  function memoryStorage() {
    const values = new Map<string, string>();
    return {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
  }

  it('round-trips even an invalid in-progress working copy', () => {
    const storage = memoryStorage();
    const initial = createPhotographyProjectTemplate();
    const working = { ...initial, title: '' };
    const key = projectDraftKey('new:photography');
    writeProjectDraft(storage, key, working, '2026-08-31T12:00:00.000Z');
    expect(readProjectDraft(storage, key, initial)).toMatchObject({
      source: 'local',
      savedAt: '2026-08-31T12:00:00.000Z',
      project: { title: '' },
    });
    clearProjectDraft(storage, key);
    expect(readProjectDraft(storage, key, initial).source).toBe('initial');
  });

  it('falls back safely when local data is corrupted', () => {
    const storage = memoryStorage();
    const initial = createDesignProjectTemplate();
    storage.setItem(projectDraftKey('new:design'), '{bad json');
    const loaded = readProjectDraft(storage, projectDraftKey('new:design'), initial);
    expect(loaded.source).toBe('initial');
    expect(loaded.recoveryNotice).toContain('damaged');
  });

  it('keeps staged media and the matching server revision in the recovery envelope', () => {
    const storage = memoryStorage();
    const initial = createDesignProjectTemplate();
    const key = projectDraftKey('new:design');
    writeProjectDraft(storage, key, initial, '2026-09-01T12:00:00.000Z', {
      mediaIds: ['staged-1'],
      serverRevision: 'revision-1',
    });
    expect(readProjectDraft(storage, key, initial)).toMatchObject({
      mediaIds: ['staged-1'],
      serverRevision: 'revision-1',
      savedAt: '2026-09-01T12:00:00.000Z',
    });
  });
});
