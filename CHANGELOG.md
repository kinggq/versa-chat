# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-03-19

### Added

- Initial public release preparation: `exports`, `sideEffects`, MIT license, tests, changelog.
- `sortSessionItems` utility (also used internally by session list).
- Core tests: session sort, IMInput, MessageList, VersatileIM smoke.

### Changed

- Build order: Vite library build first, then `vue-tsc` emit declarations to `dist/` (fixes missing `.d.ts` after publish).

### Notes

- **0.x**: APIs may change; pin a minor version in production.

[Unreleased]: https://github.com/kinggq/versa-chat/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kinggq/versa-chat/releases/tag/v0.1.0
