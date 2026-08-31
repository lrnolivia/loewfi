import type { ProjectDocument, RichText } from '../../../shared/content/types';
import { ContentValidationError, parseProjectDocument } from '../../../shared/content/validation';

export type ProjectDraftValidation =
  | { valid: true; project: ProjectDocument; issues: [] }
  | { valid: false; issues: Array<{ path: string; message: string }> };

export function validateProjectDraft(project: ProjectDocument): ProjectDraftValidation {
  try {
    return { valid: true, project: parseProjectDocument(project), issues: [] };
  } catch (error) {
    if (error instanceof ContentValidationError) {
      return { valid: false, issues: error.issues };
    }
    throw error;
  }
}

export function replaceAt<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, itemIndex) => itemIndex === index ? value : item);
}

export function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const destination = index + direction;
  if (destination < 0 || destination >= items.length) return items;
  const next = [...items];
  [next[index], next[destination]] = [next[destination], next[index]];
  return next;
}

export function nextStableId(existing: string[], base: string): string {
  if (!existing.includes(base)) return base;
  let suffix = 2;
  while (existing.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function richTextPlainText(value: RichText): string {
  return value.map((node) => node.text).join('');
}
