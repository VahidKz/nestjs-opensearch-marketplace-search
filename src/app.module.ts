import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { CatalogModule } from './catalog/catalog.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { environmentValidationSchema } from './config/environment.schema';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      expandVariables: true,
      isGlobal: true,
      validationSchema: environmentValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
        ],
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    DatabaseModule,
    CatalogModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
