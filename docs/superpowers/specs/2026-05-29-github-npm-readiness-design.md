# GitHub and npm Readiness Design

## Goal

Prepare this fork for pushing to GitHub and publishing as `moegirl-wiki-mcp-fix` on npm. The repository should explain the AstrBot/OpenAI schema compatibility fix and provide install/configuration instructions that do not depend on the original npm package.

## Scope

- Update README for npm, GitHub, AstrBot, Claude Desktop, development, and publish workflows.
- Add a `.gitignore` suitable for a TypeScript npm package.
- Update package metadata so the package can be published under `moegirl-wiki-mcp-fix`.
- Preserve `dist/` in the published package because `main` and `bin` point to compiled files.
- Keep the existing GPL-3.0 license.

## Non-Goals

- Do not add GitHub Actions in this pass.
- Do not publish to npm automatically.
- Do not create a git commit because this directory is not currently a git repository.

## Verification

Run `npm run build` and `npm test` after the changes. `npm test` should use the schema compatibility regression test rather than the external Moegirl API smoke test.
