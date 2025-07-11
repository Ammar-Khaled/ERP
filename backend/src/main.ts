import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { QueryFailedErrorFilter } from './common/filters/query-failed-error.filter';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import { LanguageInterceptor } from './common/interceptors/language.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('ERP backend API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const documentFactory = () => {
    const document = SwaggerModule.createDocument(app, config);

    // Apply JWT auth to all endpoints by default
    const paths = document.paths;
    Object.keys(paths).forEach((path) => {
      Object.keys(paths[path]).forEach((method) => {
        // Skip auth endpoints
        if (!path.includes('/auth/login') && !path.includes('/auth/register')) {
          paths[path][method].security = [{ 'JWT-auth': [] }];
        }
      });
    });

    return document;
  };

  SwaggerModule.setup('/api/v1/docs/swagger', app, documentFactory);
  app.useGlobalPipes(
    new ValidationPipe({
      // exceptionFactory: (errors) => {
      //   const validationMessages = errors.map((error) =>
      //     Object.values(error.constraints).join(', '),
      //   );
      //   return new BadRequestException({
      //     message: validationMessages.join(', '),
      //   });
      //   // TODO handle nested validation errors when no constraints but children in the error object
      // },
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalFilters(new QueryFailedErrorFilter());
  app.useGlobalInterceptors(new SuccessInterceptor());
  app.useGlobalInterceptors(new LanguageInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
