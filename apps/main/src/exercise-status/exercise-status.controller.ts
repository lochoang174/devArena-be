import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Put } from '@nestjs/common';
import { ExerciseStatusService } from './exercise-status.service';
import { CreateExerciseStatusDto } from './dto/create-exercise-status.dto';
import { UpdateExerciseStatusDto } from './dto/update-exercise-status.dto';

@Controller('exercise-status')
export class ExerciseStatusController {
  constructor(private readonly exerciseStatusService: ExerciseStatusService) { }


  @Post()
  async create(@Body() createExerciseStatusDto: CreateExerciseStatusDto) {
    try {
      return await this.exerciseStatusService.create(createExerciseStatusDto);

    }
    catch (err) {
      throw new HttpException(
        { success: false, message: 'Failed to create exercise status', },
        HttpStatus.CONFLICT,
      );
    }
  }

  @Put("user/:userId/exercise/:exerciseId")
  async update(@Param("userId") userId: string, @Param("exerciseId") exerciseId: string) {
    try {
      return await this.exerciseStatusService.update(userId, exerciseId);
    }
    catch (err) {
      throw new HttpException(
        { success: false, message: 'Failed to update exercise status', },
        HttpStatus.CONFLICT,
      );
    }
  }

  @Get("user/:userId/exercise/:exerciseId")
  async getExerciseStatusByUserAndExercise(@Param("userId") userId: string, @Param("exerciseId") exerciseId: string) {
    return await this.exerciseStatusService.findOneByUSerAndExercise(userId, exerciseId);
  }

  @Get("course/:courseId/user/:userId")
  async getExerciseStatus(@Param("courseId") courseId: string, @Param("userId") userId: string) {
    return await this.exerciseStatusService.findAllByUserAndCourse(userId, courseId);
  }



}
