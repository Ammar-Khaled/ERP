import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { QueryFailedErrorFilter } from './common/filters/query-failed-error.filter';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('ERP backend API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v1/docs/swagger', app, documentFactory);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const validationMessages = errors.map((error) =>
          Object.values(error.constraints).join(', '),
        );
        return new BadRequestException({
          message: validationMessages.join(', '),
        });
      },
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalFilters(new QueryFailedErrorFilter());
  app.useGlobalInterceptors(new SuccessInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
