import { NestFactory, Reflector } from "@nestjs/core";
import { MainModule } from "./main.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MAIN_SERVICE, TransformInterceptor } from "@app/common";
import { Transport } from "@nestjs/microservices";
import { JwtAuthGuard } from "./auth/guards/jwt.guard";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MainModule);
  const configService = app.get(ConfigService);

  // app.connectMicroservice({
  //   name: MAIN_SERVICE,
  //   transport: Transport.TCP,
  //   options: {
  //     host: "0.0.0.0",
  //     port: configService.get("TCP_PORT"),
  //   },
  // });
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix("api");
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  console.log("Static assets served from:", join(__dirname, "../../../apps/main/", "uploads"));
  app.useStaticAssets(join(__dirname, "../../../apps/main/", "uploads"), {
    prefix: "/uploads",
  });
  console.log(configService.get<number>("MONGODB_URI"))
  const port = configService.get<number>("PORT");

  await app.listen(port);
}
bootstrap();
