import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(configService.get<string>('PORT', '26313'));
}

void bootstrap();
