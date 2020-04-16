import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../../hasura-graphql';

interface GqlClientArgs {
  endpoint: string;
}

const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;

export class GqlClient {
  private client: GraphQLClient;
  constructor({ endpoint }: GqlClientArgs) {
    this.client = new GraphQLClient(endpoint);
  }

  get sdk() {
    return getSdk(this.client);
  }
}

interface GqlClientFactoryArgs {
  endpoint: string;
}

const gqlClientFactory = (
  { endpoint }: GqlClientFactoryArgs = {
    endpoint: HASURA_ENDPOINT
  }
) => {
  return new GqlClient({ endpoint });
};

export default gqlClientFactory;
