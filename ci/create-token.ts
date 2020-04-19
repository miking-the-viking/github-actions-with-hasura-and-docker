import axios from 'axios';

import * as _replace from 'replace-in-file';

// Fix types
const replace = (_replace as unknown) as (
    config: _replace.ReplaceInFileConfig
) => Promise<_replace.ReplaceResult[]>;

const ENVRC_PATH = './.envrc';
// const ENVRC_PATH = './ci/.testfile'; //dev

const GITHUB_ACTIONS_AGENT_TOKEN = process.env.GITHUB_ACTIONS_AGENT_TOKEN;
const GITHUB_REPOSITORY_URL = process.env.GITHUB_REPOSITORY_URL;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_REGISTER_RUNNER_TOKEN_URL = (
    username: string,
    repository: string
) => `/repos/${username}/${repository}/actions/runners/registration-token`;

class TokenMaker {
    public async getToken(
        username: string,
        repository: string,
        apiToken: string
    ) {
        console.log(
            `getting token for ${username} - ${repository} - ${apiToken}`
        );

        const response = await axios.post(
            GITHUB_API_BASE +
                GITHUB_REGISTER_RUNNER_TOKEN_URL(username, repository),
            {},
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiToken}`
                }
            }
        );

        return response.data.token;
    }

    public async updateEnvrcToken(newToken: string) {
        console.log(
            `Updating envrc to have new github api runner token: ${newToken}`
        );
        replace({
            files: ENVRC_PATH,
            from: /export GITHUB_ACTIONS_AGENT_TOKEN=[^\n]*/,
            to: `export GITHUB_ACTIONS_AGENT_TOKEN=${newToken}`
        });
    }

    public async refreshRunnerToken() {
        const token = await this.getToken(
            GITHUB_USERNAME,
            GITHUB_REPOSITORY,
            GITHUB_API_TOKEN
        );
        this.updateEnvrcToken(token);
    }
}

(async () => {
    const maker = new TokenMaker();
    maker.refreshRunnerToken();
})();
