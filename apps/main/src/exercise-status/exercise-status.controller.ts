import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExerciseStatusService } from './exercise-status.service';
import { CreateExerciseStatusDto } from './dto/create-exercise-status.dto';
import { UpdateExerciseStatusDto } from './dto/update-exercise-status.dto';

@Controller('exercise-status')
export class ExerciseStatusController {
  constructor(private readonly exerciseStatusService: ExerciseStatusService) {}
  @Get("course/:courseId/user/:userId")
  async getExerciseStatus(@Param("courseId") courseId: string, @Param("userId") userId: string) {
    return await this.exerciseStatusService.findAllByUserAndCourse(userId,courseId );
  }



}
