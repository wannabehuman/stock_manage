import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
// import * as session from 'express-session';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  

  app.setGlobalPrefix('api');
  // 전역 유효성 검사 파이프 적용
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  // app.enableCors();  // CORS 허용

  app.enableCors({
    origin: 'http://localhost:5173', // Vue.js 서버 주소
    credentials: true, // 쿠키/세션을 사용한다면 필수
  });
  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET,
  //     resave : false,
  //     saveUninitialized: false,
  //     cookie:{
  //       maxAge: 1000 * 60 * 60,
  //     },
  //   }),
  // );

  await app.listen(3000);
}
bootstrap();
