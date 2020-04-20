# GitHub Actions - Sample CI Repository

> Plus you can then finally add this sweet fucking status badge to your repository!

![Basic Hasura/Postgres/NestJs CI](https://github.com/miking-the-viking/github-actions-with-hasura-and-docker/workflows/Basic%20Hasura/Postgres/NestJs%20CI/badge.svg)

## Hasura - NxMonorepo - NestJs - Docker-Compose

### This is a Template Repository for Advanced CI using GitHub Actions

This repository demonstrates setting up the basics of a GitHub Actions CI pipeline with samples for GitHub Hosted and Self-Hosted options.

The CI approach is Containerized Hasura/Postgres using an Nx Monorepo with a sample NestJs project.

### Requirements

- Direnv
- Yarn
- Docker/Docker-Compose
- Direnv

## Setup Steps

### Install Dependencies

Install the dependencies using `yarn`.

### Configure Environment Variables

Copy the `.envrc.example` to `.envrc` and modify the values as necessary.

> If you are intending on using the Self-Hosted option then ensure that you update: `GITHUB_API_TOKEN`, `GITHUB_USERNAME`, `GITHUB_REPOSITORY`.

#### GitHub Api Key (Only if wanting to use the Self-Hosted Option)

![Easy, Peasy Self-Hosted Setup!](docs/agent_registration.gif)

If you are intending on using the Self-Hosted option, there's a manual step of registering/retrieving an agent token (**that is only valid for 1 hour**) that isu sed by the agent to register with GitHub to respond to your repository's events. This is made much easier by their API whcich can enable us to programmatically retrieve this token.

You can create a GitHub Api Key on GitHub by visiting your `Settings` -> `Developer Settings` -> `Personal access tokens`.

In order to automatically create workflow agent tokens the api key requires `workflows` and full `repo` access.

![Generate a GitHub API Token](docs/generate_api_token.gif)

### Configure your CI Environment Variables - GitHub Secrets

> CI Environment variables are being configured using GitHub Secrets.

Configure the ENV for the CI Pipeline using GitHub Secrets. The CI pipeline utilizes a parallel `./ci/docker-compose.ci.yml` stack with different ports and slightly modified naming to prevent collisions.

1. Navigate to the `Settings` -> `Secrets` in your repository
2. Add the required env variables as secrets here. Refer to GitHub actions documentation for more information on env injection.
   - `DB_PASSWORD` - copy from `.envrc`
   - `DB_USER` - copy from `.envrc`
   - `HASURA_ENDPOINT` - for CI use `http://localhost:8082/v1/graphql
   - `HASURA_GRAPHQL_DATABASE_URL` - for CI use `postgres://prisma:prisma@postgres-ci:5432/prisma` (note `postgres-ci` instead of `postgres-sample`, that is because ci uses `docker-compose.ci.yml`)
   - `HASURA_GRAPHQL_ENABLED_LOG_TYPES` - copy from `.envrc`
   - `HASURA_GRAPHQL_ENABLE_CONSOLE` - `false`
   - `HASURA_GRAPHQL_MIGRATIONS_DIR` - copy from `.envrc` but instead of `$PWD` just use `.` (`./hasura/migrations`)

### Decide on Hosting

This repository demonstrates the differences between GitHub Hosted and Self Hosted Solutions. Self Hosted solutions require a host machine to be running in order to execute the workflow whereas GitHub Hosted are always available.

#### GitHub Hosted

If you want to use the GitHub Hosted option,

1. Uncomment the `Build-and-Test-GitHub-Hosted` job in `.github/workflows/ci.yml`
2. Comment out the `Build-and-Test-Self-Hosted` job in `.github/workflows/ci.yml`

#### Self Hosted

If you want to use the Self Hosted option,

1. Ensure that you have a valid GitHub API Key with sufficient permissions and have it added to `GITHUB_API_TOKEN` along with configuring `GITHUB_USERNAME` and `GITHUB_REPOSITORY` in the `.envrc`
2. Run `yarn actions:total`, which is a convenience script for:
   - `yarn actions:create-token` - use the stored `GITHUB` repository, username, and api key to retrieve a self-hosted actions agent token and automatically store it in the `.envrc`
   - `direnv allow` - to update the environment variables
   - `yarn actions:agent` - build and run the actions agent container with the configured token and repository.
3. Ensure the `Build-and-Test-Self-Hosted` is uncommented in `.github/workflows/ci.yml`
4. Ensure the `Build-and-Test-GitHub-Hosted` is commented out `.github/workflows/ci.yml`
5. From this point onward you should now have a functioning basic CI pipeline that you can build off of.

### Notes

- There's no need to only use the self-hosted or github-hosted runners, it is definitely possible to run both jobs concurrently. Play around!
- This can definitely be improved upon. Submit your ideas!
- I haven't figured out a good update path for the Agent... it self updates but exits the container on completion. This necessitates all instances of the version string with the new version in the `agent-container.dockerfile`. I've introduced an optional `GITHUB_ACTIONS_AGENT_VERSION` build arg that can be used to override the default agent version in the dockerfile. Please let me know if you know an easy solution to this problem that's less manual!
