# Research and Evidence

Store concise conclusions and provenance here, not raw transcripts. Mark dated findings as historical until revalidated.

## Portfolio/source reconnaissance (historical)

- The repository contains a fuller legacy static portfolio and organized real assets under `portfolio/`, alongside mockup reference pages. The older site was exported from Squarespace and depended on hosted behavior; the preserved portfolio README documents its static rebuild and authoring conventions.
- Historical CMS milestone discovery used Hydroviv, CK Steele, Aveda Studio, About, Home, and Contact as representative content. It identified distinct narrative design and photography gallery structures. See archived Milestones 1–3.
- **Use:** inspect actual current source and content before inventing placeholders, schema, route behavior, or asset mappings. The project-specific authoring references remain [portfolio/README.md](../portfolio/README.md) and [ASSET-NAMING.md](../portfolio/ASSET-NAMING.md).

## Historical CMS implementation findings

- The milestone records describe schema validation before artifact rendering, with rendering kept deterministic and separate from filesystem, Git, draft storage, and deployment side effects.
- Cloudflare Access was the documented identity boundary; presence checks in application middleware were explicitly not a substitute for Access itself or production configuration verification.
- Media staging accepted JPEG/PNG/WebP into temporary `CMS_MEDIA` storage with a 30-day expiry; drafts used `CMS_DRAFTS`, revision checks, and local browser recovery. These are milestone-era observations, not a current capability assertion.
- Cloudflare KV read/check/write revision handling was documented as optimistic rather than atomic. The historical beta assumption was single-editor; multi-editor coordination would need reliability review.
- Detailed source, verification, and limitations are preserved verbatim in `docs/archive/architecture/`.
