# Microbundle Typescript Starter Template

Opinionated template repository for creating Javascript libraries with Typescript, Microbundle, Vitest, Biome, and a bunch of other tools.

<!-- toc -->

- [Motivation](#motivation)
- [Getting Started](#getting-started)
- [Compiling Typescript via Microbundle](#compiling-typescript-via-microbundle)
- [Testing via Vitest](#testing-via-vitest)
- [Linting and Formatting code via Biome](#linting-via-biome)
- [Continuous Integration](#continuous-integration)
- [Git Hooks](#git-hooks)
- [Debugging](#debugging)
- [Managing versions via changesets](#managing-versions-via-changesets)
- [Generating API documentation](#generating-api-documentation)
- [Renovate Bot](#renovate-bot)
- [Publishing to NPM](#publishing-to-npm)
- [Package manager](#package-manager)
- [VSCode Dev Container](#vscode-dev-container)

<!-- tocstop -->

## Motivation

Setting up a modern Typescript or Javascript development stack is a daunting task, there are a lot of moving parts, and sometimes the whole process seems like magic. I've maintained my babel configuration, and build process but it was getting tiresome to maintain, so I switched to [microbundle](https://github.com/developit/microbundle). While microbundle handles the compilation, there are a lot of other moving parts that need to be set up to start developing with Nodejs/Typescript (CI, test, etc).

This repository is actively maintained and as new versions of tools are being released it is updated and modified accordingly.

## Getting Started

You can immediately create your repo by clicking on the `Use this template button` in the Github page UI. Or you can use [deGit](https://github.com/Rich-Harris/degit) which is a very convenient tool to quickly download the repository (without git clone) `degit https://github.com/ivandotv/microbundle-template`

## Compiling Typescript via Microbundle

Typescript files are compiled via [Microbundle](https://github.com/developit/microbundle), there are two scripts (`build:dev` and `build:prod`)
Microbundle creates three bundles, `modern (es6)` `cjs` and `umd`. Also in the `exports` field in the package.json there are three keys:

- `development` - used by bundlers while developing
- `import` - es6 (module) build of the library
- `require` - Commonjs build of the library


## Testing via Vitest

Vitest is used for testing. You can write your tests in Typescript and they will be compiled via babel targeting the nodejs version that is running the tests. The testing environment is set to `node` you might want to change that if you need access to `DOM` in your tests (use `jsdom`).

There are three tasks for running tests:

- `test` run all test and report code coverage
- `test:watch` continuously run tests by watching some or all files

## Linting via Biome

- [Biome.js](https://biomejs.dev/) is used for linting and formatting.

## Continuous Integration

Github actions are used for continuous integration and testing.
Github action name is `Test` and this is what it does:

- run on `push` to all branches
- run on `pull request` to `main` and `develop` branches
- run tests on node versions [21]
- lint source
- build source
- run tests
- generate code coverage
- consume changesets
  - bump package versions
  - generate changelog
  - publish to npm
- generate API docs (from source code, only if the package is published)
- make a commit with new API docs.

## Git Hooks

- [Lefthook](https://github.com/evilmartians/lefthook) is used for checking code before it is commited

## Debugging

If you are using VS Code as your editor,
there are three debug configurations:

- `Main` debug the application by running the compiled `index.js` file.
- `Current test file` debug currently focused test file inside the editor.

## Managing versions via changesets

For maintaining package versions I'm using [changesets](https://github.com/changesets/changesets)

## Generating API documentation

You can generate API documentation from your source files via [typedoc](https://typedoc.org)(`pnpm gen:docs`).
Currently, documentation will be generated into `docs/api` directory and it is generated in markdown so it can be displayed on Github.

- Private class members are excluded.
- Declarations with `@internal` are excluded.
- Only exported properties are documented.

## Renovate Bot

There is a renovate bot configuration file for automatically updating dependencies. Make sure to active `renovate bot` first via [github marketplace.](https://github.com/marketplace/renovate)

## Publishing to NPM

Manual publishing is done via `pnpm release` this task will go through regular NPM publish steps and will call [`prepublishOnly` life cycle script](https://docs.npmjs.com/cli/v7/using-npm/scripts#life-cycle-scripts).

## Package manager

[pnpm](https://pnpm.io) is my package manager of choice. You can use something else, just make sure to update the scripts in package.json and change any references to pnpm.

## VSCode Dev Container

There is a vscode dev container setup that uses `Node v16`, github cli, and docker in docker. It also automatically installs `pnpm` in the container, and sets `git` to automatically sings the commits.
