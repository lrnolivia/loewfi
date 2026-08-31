import type { CmsKvNamespace } from '../../functions/admin/api/_lib/types';

type StoredValue = { value: string | ArrayBuffer; metadata?: unknown };

export class MemoryKv implements CmsKvNamespace {
  private readonly values = new Map<string, StoredValue>();

  async get(key: string): Promise<string | null>;
  async get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  async get(key: string, type?: 'arrayBuffer'): Promise<string | ArrayBuffer | null> {
    const stored = this.values.get(key)?.value;
    if (stored === undefined) return null;
    if (type === 'arrayBuffer') {
      return typeof stored === 'string' ? new TextEncoder().encode(stored).buffer : stored.slice(0);
    }
    return typeof stored === 'string' ? stored : new TextDecoder().decode(stored);
  }

  async getWithMetadata<Metadata>(key: string, _type: 'arrayBuffer'): Promise<{ value: ArrayBuffer | null; metadata: Metadata | null }> {
    const stored = this.values.get(key);
    if (!stored) return { value: null, metadata: null };
    const value = typeof stored.value === 'string'
      ? new TextEncoder().encode(stored.value).buffer
      : stored.value.slice(0);
    return { value, metadata: (stored.metadata ?? null) as Metadata | null };
  }

  async put(key: string, value: string | ArrayBuffer, options?: { expirationTtl?: number; metadata?: unknown }): Promise<void> {
    this.values.set(key, { value: typeof value === 'string' ? value : value.slice(0), metadata: options?.metadata });
  }

  async delete(key: string): Promise<void> {
    this.values.delete(key);
  }
}
