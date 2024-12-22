import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { Exercise, ExerciseSchema } from './schema/exercise.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [ExerciseController],
  providers: [ExerciseService],
    imports:[ MongooseModule.forFeature([{ name: Exercise.name, schema:ExerciseSchema }])]
  
})
export class ExerciseModule {}
