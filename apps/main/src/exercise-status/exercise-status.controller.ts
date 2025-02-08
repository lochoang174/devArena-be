import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Put, Query } from '@nestjs/common';
import { ExerciseStatusService } from './exercise-status.service';
import { CreateExerciseStatusDto } from './dto/create-exercise-status.dto';
import { UpdateExerciseStatusDto } from './dto/update-exercise-status.dto';
import { CurrentUser, IUser } from '@app/common';

@Controller('exercise-status')
export class ExerciseStatusController {
  constructor(private readonly exerciseStatusService: ExerciseStatusService) { }
  @Get("/exercise/:exerciseId/submission")
  async getSubmissions(@Param("exerciseId") id: string, @CurrentUser() user: IUser) {
    return await this.exerciseStatusService.getSubmissions(user.id, id)
  }

  @Get("/exercise/:exerciseId/submission/:submissionId")
  async getSubmission(@Param("exerciseId") exerciseId: string, @Param("submissionId") submissionId: string, @CurrentUser() user: IUser) {
    return await this.exerciseStatusService.getOneSubmission(user.id, exerciseId, submissionId)
  }

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

  @Put("exercise/:exerciseId")
  async update(@CurrentUser() user: IUser, @Param("exerciseId") exerciseId: string) {
    try {
      return await this.exerciseStatusService.update(user.id, exerciseId);
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

  @Get("profile")
  async getProfile(@CurrentUser() user: IUser) {
    return await this.exerciseStatusService.getProfile(user.id);
  }



}
