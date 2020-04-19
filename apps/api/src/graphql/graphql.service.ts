import { Injectable } from '@nestjs/common';
import gqlClientFactory, { GqlClient } from './GqlClientFactory';

const ENDPOINT =
  process.env.HASURA_ENDPOINT || 'http://localhost:8081/v1/graphql';

@Injectable()
export class GraphqlService {
  private gqlClient: GqlClient = GraphqlService.initClient(ENDPOINT);

  public static initClient(endpoint?: string) {
    return gqlClientFactory(endpoint ? { endpoint } : undefined);
  }

  get sdk() {
    return this.gqlClient.sdk;
  }
}
