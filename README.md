# GitHub Actions - Sample CI Repository

## Hasura - NxMonorepo - NestJs - Docker-Compose

This repository demonstrates setting up the basics of a GitHub Actions CI pipeline with samples for GitHub Hosted and Self-Hosted options.

The CI approach is Containerized Hasura/Postgres using an Nx Monorepo with a sample NestJs project.

## Setup Steps

1. Install the dependencies using `yarn`.

2. Copy the `.envrc.example` to `.envrc`

3. Configure the ENV using GitHub Secrets

   5. Navigate to the `Settings` -> `Secrets` in your repository
   6. Add the required env variables as secrets here. Refer to GitHub actions documentation for more information on env injection.
      - `DB_PASSWORD` - copy from `.envrc`
      - `DB_USER` - copy from `.envrc`
      - `HASURA_ENDPOINT` - copy from `.envrc`
      - `HASURA_GRAPHQL_DATABASE_URL` - copy from `.envrc`
      - `HASURA_GRAPHQL_ENABLED_LOG_TYPES` - copy from `.envrc`
      - `HASURA_GRAPHQL_ENABLE_CONSOLE` - `false`
      - `HASURA_GRAPHQL_MIGRATIONS_DIR` - copy from `.envrc` but instead of `$PWD` just use `.` (`./hasura/migrations`)

4. If you want to use the GitHub Hosted option,

   8. Uncomment the `Build-and-Test-GitHub-Hosted` job in `.github/workflows/ci.yml`
   9. Comment out the `Build-and-Test-Self-Hosted` job in `.github/workflows/ci.yml`

5. If you want to use the Self Hosted option,

   11. Navigate to `Settings` -> `Actions` in your repository
   12. Click `Add runner`, select appropriate architecture (in my case `Linux`, `X64`).
   13. In the `Configure` section there is a command with 2 pieces we want to extract: the `--url` and the `--token`, copy those values and paste then into the `.envrc` file in the `GITHUB_REPOSITORY_URL` and `GITHUB_ACTIONS_AGENT_TOKEN` fields, respectively.
   14. Ensure the `Build-and-Test-Self-Hosted` is uncommented in `.github/workflows/ci.yml`
   15. Ensure the `Build-and-Test-GitHub-Hosted` is commented out `.github/workflows/ci.yml`
   16. Run `yarn actions:agent`. This will spin up the agent container with your `url` and `token`, automatically reigstering with the repository.

6. From this point onward you should now have a functioning basic CI pipeline that you can build off of.

### Notes

- There's no need to only use the self-hosted or github-hosted runners, it is definitely possible to run both jobs concurrently. Play around!
- This can definitely be improved upon.
- I haven't figured out a good update path for the Agent... it self updates but exits the container on completion. This necessitates all instances of the version string with the new version in the `agent-container.dockerfile`. I've introduced an optional `GITHUB_ACTIONS_AGENT_VERSION` build arg that can be used to override the default agent version in the dockerfile.
