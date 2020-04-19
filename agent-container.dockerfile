FROM node:lts AS BaseDependencyBuild

RUN apt-get update \
    && apt-get -qq -y install curl \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common;

RUN mkdir actions-runner && cd actions-runner

WORKDIR /actions-runner

# Docker
RUN curl -sSL https://get.docker.com/ | sh
RUN docker --version

# Docker-Compose
RUN curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
RUN chmod +x /usr/local/bin/docker-compose
RUN docker-compose --version

FROM BaseDependencyBuild as RunnerSetupBuild

ENV RUNNER_ALLOW_RUNASROOT 1

ARG GITHUB_ACTIONS_AGENT_VERSION=2.169.0
ENV AGENT_VERSION=$GITHUB_ACTIONS_AGENT_VERSION


RUN curl -O -L "https://github.com/actions/runner/releases/download/v{$AGENT_VERSION}/actions-runner-linux-x64-{$AGENT_VERSION}.tar.gz"

RUN tar xzf "./actions-runner-linux-x64-$AGENT_VERSION.tar.gz"

RUN ./bin/installdependencies.sh

FROM RunnerSetupBuild AS RunnerConfigurationAndExecutionBuild

ARG GITHUB_ACTIONS_AGENT_TOKEN=NotAValidKey
ENV AGENT_TOKEN=$GITHUB_ACTIONS_AGENT_TOKEN

ARG GITHUB_REPOSITORY_URL=miking-the-viking/github-actions-with-hasura-and-docker
ENV REPOSITORY_URL=$GITHUB_REPOSITORY_URL


RUN ./config.sh --url $REPOSITORY_URL --token $AGENT_TOKEN

CMD ["./run.sh"]