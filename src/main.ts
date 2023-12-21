import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as hbs from 'hbs';
import { AppModule } from './app.module';
import { API_VERSION, BASE_URL, NODE_ENV, PORT } from './environments';
import { LoggerMiddleware, TimeoutInterceptor } from './core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';

declare const module: any;
console.log(BASE_URL);
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger(),
  });

  app.getHttpAdapter();

  NODE_ENV !== 'testing' && app.use(LoggerMiddleware);

  app.useGlobalInterceptors(new TimeoutInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      
    })
  );
  app.use(cookieParser());
  app.use(
    session({
      secret: 'i love you',
      resave: false,
      saveUninitialized: false,
    })
  );
  app.enableShutdownHooks();

  app.setGlobalPrefix(API_VERSION, {
    exclude: [
      { path: 'login', method: RequestMethod.GET },
      { path: '', method: RequestMethod.GET },
      { path: 'comic', method: RequestMethod.GET },
      { path: 'addcomic', method: RequestMethod.GET },
      { path: 'comic/detail_comic', method: RequestMethod.GET },
      { path: 'home', method: RequestMethod.GET },
      { path: 'user', method: RequestMethod.GET },
      { path: 'user/detail_user', method: RequestMethod.GET },
      { path: 'fourm', method: RequestMethod.GET },
      { path: 'gender', method: RequestMethod.GET },
      { path: 'gender/detail_gender', method: RequestMethod.GET },
      { path: 'gender/add_gender', method: RequestMethod.GET },
      { path: 'chapter/add_chapter', method: RequestMethod.GET },
      { path: 'detail_chapter/:comic_uuid', method: RequestMethod.GET },
    ],
  });

  //hanlder bar
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(
    join(
      __dirname,
      '..',
      NODE_ENV === 'development' ? 'src/views' : 'dist/views'
    )
  );
  // hbs.registerPartials(join(__dirname, '..', 'src/views/partials'));
  // hbs.registerPartials(join(__dirname, '..', 'src/views/layouts'));
  // hbs.registerHelper(join(__dirname, '..', 'src/views/helpers'));
  app.setViewEngine('hbs');

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap().catch((error) => {
  Logger.error(`Server Can Not Start. Error: ${error.message}`, false);
  process.exit(1);
});
