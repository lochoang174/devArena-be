import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AsyncModelFactory,
  ModelDefinition,
  MongooseModule,
} from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    // MongooseModule.forFeature([{ name: "Exercise", schema: ExerciseSchema }]), // Đăng ký Exercise trong DatabaseModule
  ],

})
export class DatabaseModule {
    static forFeature(
      models: ModelDefinition[],
      // connectionName: string,
    ): DynamicModule {
        return MongooseModule.forFeature(models);

    }
  }
