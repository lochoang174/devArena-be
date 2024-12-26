import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExerciseStatusService } from './exercise-status.service';
import { CreateExerciseStatusDto } from './dto/create-exercise-status.dto';
import { UpdateExerciseStatusDto } from './dto/update-exercise-status.dto';

@Controller('exercise-status')
export class ExerciseStatusController {
  constructor(private readonly exerciseStatusService: ExerciseStatusService) {}

  @Post()
  create(@Body() createExerciseStatusDto: CreateExerciseStatusDto) {
    return this.exerciseStatusService.create(createExerciseStatusDto);
  }

  @Get()
  findAll() {
    return this.exerciseStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exerciseStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExerciseStatusDto: UpdateExerciseStatusDto) {
    return this.exerciseStatusService.update(+id, updateExerciseStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exerciseStatusService.remove(+id);
  }
}
