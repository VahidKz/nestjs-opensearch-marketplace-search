import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProductIndexingService } from '../src/search/application/product-indexing.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  try {
    const indexer = app.get(ProductIndexingService);
    const result = await indexer.reindexAll();
    console.log(`Reindexed ${result.indexed} products`);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
