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
import { StudyModule } from './study/study.module';
import { AlgorithmModule } from './algorithm/algorithm.module';
import { DatabaseModule } from '@app/common/databases';
import { MongooseModelsModule } from './schemas/mongoose.model';

import { SubmissionModule } from './submission/submission.module';
import { CourseModule } from './course/course.module';
import { CourseStatusModule } from './course-status/course-status.module';
import { ExerciseStatusModule } from './exercise-status/exercise-status.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../apps/main/.env'),
    }),
    DatabaseModule,
    MongooseModelsModule,
    AuthModule, UserModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(__dirname, 'schema.gql'), // Tạo schema tự động
      playground: true, // Bật GraphQL Playground (dành cho việc thử nghiệm API)
      context: ({ req }) => ({ req }), // Có thể thêm context nếu cần
      path: '/graphql', // Định nghĩa endpoint của GraphQL
      driver: ApolloDriver,

    }),
    ExerciseModule,
    EmailModule,
    GraphExerciseModule,
    TestcaseModule,
    AlgorithmModule,
    StudyModule,
    SubmissionModule,
    CourseModule,
    CourseStatusModule,
    ExerciseStatusModule,
  ],
  controllers: [MainController],
  providers: [MainService],
})
export class MainModule {}
