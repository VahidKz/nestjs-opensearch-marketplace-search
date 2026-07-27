import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

export const OPENSEARCH_CLIENT = Symbol('OPENSEARCH_CLIENT');

export const opensearchClientProvider = {
  provide: OPENSEARCH_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const username = config.get<string>('OPENSEARCH_USERNAME');
    const password = config.get<string>('OPENSEARCH_PASSWORD');

    return new Client({
      node: config.getOrThrow<string>('OPENSEARCH_NODE'),
      auth:
        username && password
          ? {
              username,
              password,
            }
          : undefined,
    });
  },
};
