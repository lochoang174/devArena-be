import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User, UserSchema } from "../schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "@app/common";
import { MongooseModelsModule } from "../schemas/mongoose.model";

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  // imports: [
  //   DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  // ],
})
export class UserModule {}
