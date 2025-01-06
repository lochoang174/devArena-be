import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User, UserSchema } from "../schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { COMPILE_PACKAGE_NAME, COMPILE_SERVICE_NAME, DatabaseModule } from "@app/common";
import { MongooseModelsModule } from "../schemas/mongoose.model";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports:[
        ClientsModule.register([
          {
            name: COMPILE_SERVICE_NAME,
            transport: Transport.GRPC,
            options: {
              package: 'compile',
              protoPath: join(__dirname, '../../../proto/compile.proto'), // Đường dẫn đúng
            },
          },
        ]),
  ]
  // imports: [
  //   DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  // ],
})
export class UserModule {}
