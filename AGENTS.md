# loew.fi — Production Site Agent Instructions

This is the standing directive for the `loew.fi` production repository. Read and follow it before making changes.

## Mission

Turn the existing `/mockup` into the full production loew.fi site using the real content and assets in `/portfolio`.

`/mockup` is the approved visual and interaction foundation. Preserve its design language, Liquid Glass direction, typography, spacing, motion, navigation, responsive behavior, and project presentation unless a real production requirement demands a change.

Do not stop after planning. Inspect, plan, implement, verify, commit, and push.

## CMS Coordination

A separate Codex project is building the CMS. Its current state is automatically mirrored into:

`cms-reference-clone/`

This directory is an automatically synchronized, filesystem-read-only reference clone.

Use it extensively to understand:

- canonical content structures
- project schemas and metadata
- design/editorial block types
- photography/gallery structures
- slug conventions
- asset naming conventions
- navigation/project ordering
- renderer expectations
- public-page requirements
- shared types or validation concepts relevant to the public site

### `cms-reference-clone/` is strictly READ-ONLY

You may inspect and search it.

You must NOT:

- modify it
- make it writable
- create, delete, or rename files inside it
- reformat or clean it up
- fix CMS issues inside it
- commit it
- remove it from `.gitignore`
- depend on local edits made inside it

It may be overwritten at any time by the live CMS sync.

If you discover a CMS problem or incompatibility, report it. Do not fix the clone.

## Ownership Boundaries

This repository owns:

- the public production site
- public React components
- layouts and routing
- visual design
- Liquid Glass
- interactions and motion
- responsive behavior
- portfolio presentation
- accessibility
- SEO/public metadata
- public performance
- production deployment behavior

The CMS owns:

- admin UI
- editing
- drafts/autosave
- CMS APIs
- publishing workflows
- CMS-side validation
- history/rollback
- administrative state

Do not rebuild CMS functionality here.

Do not make the public site depend on CMS admin code.

## CMS Integration Goal

The production site and CMS are being developed separately now but will eventually be integrated.

Build this site so integration requires as little friction as possible.

Where the CMS reference has already established a sensible public-facing content contract, align the production site with it.

Do not blindly copy CMS internals into the public site.

Maintain clean boundaries between:

- content/data
- presentation
- routing
- media
- navigation/settings
- visual effects

## React

The current mockup/production work is React-based.

Preserve React where it meaningfully supports the approved implementation.

Do not convert working React experiences back to static HTML merely for simplicity.

Do not create unnecessary React state for static concerns.

Prefer reusable production components over copied mockup markup.

## Liquid Glass

The current Liquid Glass visual direction is approved production work.

Preserve:

- material character
- refraction/material behavior
- glass geometry
- navigation treatment
- hierarchy
- interactions
- visual fidelity

Do not replace it with generic CSS glassmorphism or a simplified `backdrop-filter` approximation merely because that is easier.

Performance is a first-class requirement.

Regularly test:

- slow scrolling
- fast/inertial scrolling
- frame consistency
- resize
- multiple glass surfaces
- mobile
- supported browsers

When performance is poor, find and fix the actual bottleneck rather than silently degrading the design.

## Portfolio Content

Inspect `/portfolio` thoroughly before inventing placeholders or structures.

Use real content and assets wherever available.

Build reusable support for the real content patterns you discover.

Design/editorial projects may require:

- hero
- intro
- headings
- prose
- imagery
- image/text layouts
- before/after
- image strips
- plate strips
- pull quotes
- credits
- links

Photography projects should generally remain simpler:

- metadata
- hero
- ordered gallery
- captions
- alt text
- gallery presentation settings

Align these structures with the CMS reference where sensible.

## Production Requirements

Turn `/mockup` into a real production site.

Account for the actual site's needs where relevant, including:

- homepage / portfolio index
- project routing
- project detail pages
- design/editorial layouts
- photography/gallery layouts
- About
- global navigation
- responsive layouts
- clean URLs
- 404 handling
- canonical URLs
- Open Graph/social metadata
- favicon/app metadata where appropriate
- semantic markup
- keyboard accessibility
- reduced-motion behavior
- image optimization
- responsive images
- lazy loading
- loading/failure states
- browser compatibility
- production builds
- Cloudflare deployment compatibility

Do not invent empty pages simply to satisfy a checklist.

## Performance

Treat performance as production functionality.

Watch for:

- Liquid Glass scroll cost
- unnecessary React rerenders
- layout thrashing
- oversized images
- poor responsive-image selection
- missing lazy loading
- expensive GPU effects
- DOM capture/rasterization
- route-transition cost
- resize problems
- mobile regressions

Do not silently remove approved behavior and call it optimization.

Measure actual problems where practical.

# Repository Hygiene — Mandatory and Ongoing

This repository must stay clean while it evolves.

Repository cleanup is an ongoing responsibility, not a final cleanup task.

Perform a repository-hygiene audit:

1. before a major milestone
2. after a major milestone
3. before significant pushes/releases
4. after major refactors
5. after moving mockup functionality into production
6. after changing Liquid Glass implementations
7. after large asset imports
8. whenever the repository starts becoming noisy or messy

The repository should become cleaner as the production site becomes more complete.

## Maintain `.gitignore`

Actively maintain `.gitignore`.

Identify files/directories that are:

- generated
- reproducible
- machine-specific
- cached
- temporary
- secret
- development-only
- local reference material
- unnecessary for source control

Potential candidates, ONLY when actually applicable, include:

- `node_modules/`
- `.vite/`
- `.wrangler/`
- `coverage/`
- `.DS_Store`
- `*.log`
- local `.env` files containing secrets
- temporary browser-test output
- debugging screenshots
- profiler traces
- temporary archives
- scratch directories
- local agent output
- `cms-reference-clone/`
- `REPO-CLEANUP.md`

Do not blindly add everything above.

Inspect the actual project and build architecture first.

Never ignore important production source files merely to make `git status` cleaner.

Do not ignore:

- required source code
- required production assets
- canonical content data
- deployment configuration
- required lockfiles
- intentional tests
- architecture documentation
- intentionally versioned portfolio source media

Remember that `.gitignore` does not affect files already tracked.

During hygiene audits, explicitly identify tracked files that appear unnecessary.

Do not silently untrack ambiguous files.

## Deployment Hygiene

The repository and deployed website are not the same thing.

Regularly inspect the actual production build output.

The deployment artifact must not accidentally contain:

- `cms-reference-clone/`
- CMS/internal documentation
- source archives
- test fixtures
- debug logs
- local screenshots
- profiler traces
- temporary experiments
- `.env` files
- obsolete mockup material
- unrelated repository folders
- cleanup reports
- other development-only artifacts

If something belongs in Git but not in production deployment, fix the build/deployment configuration rather than relying on `.gitignore`.

## Safe Automatic Cleanup

You may automatically remove a file only when ALL of the following are true:

- it is clearly generated or disposable
- it is reproducible
- it is not required by production/deployment
- it is not a unique source asset
- it is not user-authored portfolio content
- it is not referenced by live code/data/build configuration
- removal does not erase meaningful project history

When uncertain:

DO NOT DELETE IT.

Report it for human review instead.

Never delete an unfamiliar file solely because you do not understand it.

Never delete portfolio media solely because it appears unused without strong evidence.

## Dead-Code and Dead-Asset Audits

Regularly look for obvious dead material.

### Code candidates

- unused modules
- abandoned components
- duplicate implementations
- obsolete routes
- superseded Liquid Glass implementations
- stale feature flags
- debug-only code
- temporary compatibility shims
- mockup-only code no longer used by production

### Asset candidates

- unreferenced images
- byte-identical duplicates
- obsolete exports
- stale icons/logos
- old mockup-only assets
- temporary screenshots
- redundant generated variants

Do not delete based on a simplistic grep result alone.

Account for:

- dynamic imports
- CSS URLs
- generated content
- CMS data
- route manifests
- build-time references

# Local Cleanup Report

Maintain a LOCAL file at:

`REPO-CLEANUP.md`

Add `REPO-CLEANUP.md` to `.gitignore`.

This file is specifically for the user and must not deploy with the production site.

Update it during every repository-hygiene audit.

Use this structure:

## Last Audit

Include:

- date/time
- branch
- commit inspected
- production build status

## `.gitignore` Changes

For every rule added or removed include:

- pattern
- reason
- whether matching files were already tracked

## Safe Automatic Cleanup Performed

For every item actually removed include:

- exact path
- what it was
- why deletion was unquestionably safe
- how it can be regenerated, if relevant

## Recommended Manual Deletions

THIS SECTION IS IMPORTANT.

Identify files/directories that appear unnecessary but should be confirmed by the user before deletion.

For each include:

- exact path
- approximate size when useful
- what it appears to be
- evidence that it is obsolete or unused
- whether Git currently tracks it
- known references
- recommendation: `DELETE`, `KEEP`, or `REVIEW`

Make this section useful as a practical deletion checklist.

## Potential Duplicate Assets

For each suspected duplicate group include:

- paths
- whether files are byte-identical or merely similar
- which copy appears canonical
- references to each copy
- recommendation

Do not automatically delete visual/similarly named duplicates unless they are byte-identical and clearly redundant and unreferenced.

## Obsolete Mockup / Experiment Candidates

Identify leftovers from:

- old landing-page experiments
- superseded Liquid Glass implementations
- abandoned prototypes
- temporary `/mockup` infrastructure
- migrations
- experimental routes
- obsolete test pages/components

State whether each still has references.

## Generated / Server-Unnecessary Material

Classify each item as:

- should be `.gitignore`d
- may remain tracked but must be excluded from deployment
- safe to delete
- requires review

## Large Files

Flag unusually large tracked files.

For each include:

- path
- approximate size
- purpose
- whether optimization is appropriate
- whether it belongs in Git

Do not destructively recompress original portfolio source media without clear justification.

## Unresolved Questions

List anything whose ownership or purpose cannot be established confidently.

# Development Process

Before substantial productionization work:

1. inspect the repository
2. inspect `/mockup`
3. inspect `/portfolio`
4. inspect `cms-reference-clone/` read-only
5. understand the build/deployment architecture
6. understand the CMS-facing public contract
7. perform a repository-hygiene audit
8. update `REPO-CLEANUP.md`
9. create a concise implementation plan
10. execute it

Do not stop after planning.

# Decision-Making

Make ordinary engineering decisions autonomously.

Flag a decision only when it materially changes:

- approved visual design
- public information architecture
- Liquid Glass behavior
- portfolio content representation
- CMS compatibility
- deployment/routing
- a major user-facing interaction
- potentially destructive cleanup

Otherwise keep moving.

# Git Rules

Commit and push production-site work normally.

Never commit `cms-reference-clone/`.

Keep `cms-reference-clone/` ignored.

Keep `REPO-CLEANUP.md` ignored.

Before significant commits/pushes:

- inspect `git status`
- inspect staged changes
- ensure generated junk is not being added
- ensure local-only files are not being added
- ensure CMS reference files are not being added
- run relevant production builds/tests
- perform appropriate hygiene cleanup
- update `REPO-CLEANUP.md`

Do not use destructive Git operations on unrelated work.

# Definition of Done

Do not call this complete merely because `/mockup` looks polished.

This phase is complete when `/mockup` has effectively become the full production loew.fi foundation using real portfolio content.

Before declaring completion:

- run the production build
- test major routes
- test representative design/editorial projects
- test representative photography projects
- test responsive layouts
- test major interactions
- verify assets
- check browser console errors
- inspect obvious accessibility issues
- test Liquid Glass during scrolling
- verify production deployment behavior
- review compatibility against the latest `cms-reference-clone/`
- inspect the final diff
- perform a repository-hygiene audit
- update `REPO-CLEANUP.md`
- verify production output contains no local/reference junk

# Milestone / Final Reports

At the end of substantial work, report:

## Built
What became real production functionality.

## Portfolio Integration
Which real `/portfolio` content was incorporated.

## Architecture
Reusable components, routes, templates, and content boundaries.

## CMS Compatibility
What was learned from `cms-reference-clone/` and how the site aligns with it.

## CMS Reference Safety
Explicitly confirm `cms-reference-clone/` remained unmodified, read-only, ignored, and uncommitted.

## Liquid Glass
Current renderer/material implementation and performance findings.

## Verification
What was actually built, run, tested, and manually checked.

## Repository Hygiene
Include:

- `.gitignore` changes
- automatic cleanup performed
- new cleanup candidates
- duplicate/obsolete asset findings
- large-file findings
- confirmation that `REPO-CLEANUP.md` was updated

## Manual Deletion Candidates
Give the user a concise list of the highest-confidence files/directories that can probably be deleted, with reasons.

Do not delete ambiguous items automatically.

## Remaining Work
Anything truly unfinished or requiring user input.

## Commits
List production-site commits created and pushed.

# Core Rule

Build aggressively, clean continuously, and preserve boundaries.

The production site should become more complete while the repository becomes cleaner.

END OF AGENTS.md CONTENT.
