import { Injectable } from '@nestjs/common';
import gqlClientFactory, { GqlClient } from './GqlClientFactory';

@Injectable()
export class GraphqlService {
    private gqlClient: GqlClient = GraphqlService.initClient(
        'http://localhost:8081/v1/graphql'
    );

    public static initClient(endpoint?: string) {
        return gqlClientFactory(endpoint ? { endpoint } : undefined);
    }

    get sdk() {
        return this.gqlClient.sdk;
    }
}
