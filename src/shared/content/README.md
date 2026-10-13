# Shared content model

This directory contains the versioned, framework-independent CMS contract used at every trust boundary.

- `types.ts` defines schema version 1 and its discriminated document/block unions.
- `validation.ts` parses untrusted JSON into those types, rejects unknown fields, and checks collection-wide references.
- `fixtures/` represents the approved Hydroviv, CK Steele, Aveda Studio, About, Home, and Contact shapes using assets that exist in this repository.
- `validation.test.ts` exercises valid fixtures, unsafe inputs, structural cardinality, stable IDs, media paths, and cross-document ordering.

The fixture collection is representative migration evidence, not the complete portfolio inventory. Renderer and editor work must consume the exported parser rather than casting JSON to TypeScript types.

This boundary has no React, Cloudflare, GitHub, or Liquid Glass dependency.
