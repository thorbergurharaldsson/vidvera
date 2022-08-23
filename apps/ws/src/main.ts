import { bootstrapWebApplication, listen } from '@nestjs-snerpa/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function main() {
  const app = await bootstrapWebApplication(AppModule, {
    cors: {
      enabled: true,
      origin: '*'
    }
  });

  const options = new DocumentBuilder()
    .setTitle('Viðvera API')
    .setDescription('TODO')
    .addServer('http://localhost:8080')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .setVersion(require('../../../package.json').version)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await listen(app);
}

main().catch(console.error);
