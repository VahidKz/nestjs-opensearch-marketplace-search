import Joi from 'joi';

const logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .default('postgresql://marketplace:marketplace@localhost:5432/marketplace'),
  OPENSEARCH_NODE: Joi.string().uri().default('http://localhost:9200'),
  OPENSEARCH_USERNAME: Joi.string().allow('').default(''),
  OPENSEARCH_PASSWORD: Joi.string().allow('').default(''),
  SEARCH_INDEX_ALIAS: Joi.string().min(3).default('marketplace-products'),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .default('redis://localhost:6379'),
  LOG_LEVEL: Joi.string()
    .valid(...logLevels)
    .default('info'),
});
