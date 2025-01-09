import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Put, Query } from '@nestjs/common';
import { ExerciseStatusService } from './exercise-status.service';
import { CreateExerciseStatusDto } from './dto/create-exercise-status.dto';
import { UpdateExerciseStatusDto } from './dto/update-exercise-status.dto';
import { CurrentUser, IUser } from '@app/common';

@Controller('exercise-status')
export class ExerciseStatusController {
  constructor(private readonly exerciseStatusService: ExerciseStatusService) { }
 @Get("/submission/:id")
 async getSubmission(@Param("id") id: string,@CurrentUser() user: IUser){
  return await this.exerciseStatusService.getSubmission(user.id,id)
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

  @Put(":id")
  async update(@Param("id") id: string, @Body() updateExerciseStatusDto: Partial<CreateExerciseStatusDto>) {
    try {
      return await this.exerciseStatusService.update(id, updateExerciseStatusDto);
    }
    catch (err) {
      throw new HttpException(
        { success: false, message: 'Failed to update exercise status', },
        HttpStatus.CONFLICT,
      );
    }
  }

  @Get("course/:courseId/user/:userId")
  async getExerciseStatus(@Param("courseId") courseId: string, @Param("userId") userId: string) {
    return await this.exerciseStatusService.findAllByUserAndCourse(userId, courseId);
  }



}
