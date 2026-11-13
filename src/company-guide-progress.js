import { itemIds } from './company-guide-data.js';

export const storageKey = 'loewfi.company-guide.progress.v1';
export function readProgress(storage) {
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return { checked: {}, available: true };
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !value.checked || typeof value.checked !== 'object' || Array.isArray(value.checked)) {
      return { checked: {}, available: true };
    }
    return { checked: Object.fromEntries(itemIds.filter((id) => value.checked[id] === true).map((id) => [id, true])), available: true };
  } catch {
    return { checked: {}, available: false };
  }
}
export function saveProgress(storage, checked) {
  try {
    const safe = Object.fromEntries(itemIds.filter((id) => checked[id] === true).map((id) => [id, true]));
    storage.setItem(storageKey, JSON.stringify({ version: 1, checked: safe }));
    return true;
  } catch { return false; }
}
export function clearProgress(storage) {
  try { storage.removeItem(storageKey); return true; } catch { return false; }
}
