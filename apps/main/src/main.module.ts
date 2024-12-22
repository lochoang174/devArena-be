import { Module } from '@nestjs/common';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ExerciseModule } from './exercise/exercise.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from './email/email.module';
import { join } from 'path';
import { GraphExerciseModule } from './graph-exercise/graph-exercise.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { TestcaseModule } from './testcase/testcase.module';

@Module({
  imports: [AuthModule, UserModule, ExerciseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../apps/main/.env'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(__dirname, 'schema.gql'), // Tạo schema tự động
      playground: true, // Bật GraphQL Playground (dành cho việc thử nghiệm API)
      context: ({ req }) => ({ req }), // Có thể thêm context nếu cần
      path: '/graphql', // Định nghĩa endpoint của GraphQL
      driver: ApolloDriver,

    }),
    EmailModule,
    GraphExerciseModule,
    TestcaseModule
  ],
  controllers: [MainController],
  providers: [MainService],
})
export class MainModule {}
