// import 'dotenv/config';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.useGlobalPipes(new ValidationPipe({ transform: true }));

//   // Expo 앱의 접속을 허용하기 위한 CORS 오픈
//   app.enableCors({
//     origin: '*',
//     credentials: true,
//   });

//   await app.listen(3000, '0.0.0.0'); // 0.0.0.0 으로 바인딩하여 로컬 네트워크(모바일 기기) 전체에 개방
// }
// bootstrap();

////////////////////////////////////////////

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🌟 CORS 설정 (Next.js 프론트엔드 통신 허용)
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js 주소
    credentials: true,
  });

  await app.listen(4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
