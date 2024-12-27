import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { RolesGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard, Roles } from '@app/common';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  // @Post()
  // create(@Body() createExerciseDto: CreateExerciseDto) {
  //   return this.exerciseService.create(createExerciseDto);
  // }

  @Get()
  @Roles(['admin','client'])
  findAll() {
    return this.exerciseService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.exerciseService.findOne(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto) {
  //   return this.exerciseService.update(id, updateExerciseDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.exerciseService.remove(id);
  // }
  // @Get('language/:language')
  // findByLanguage(@Param('language') language: string) {
  //   return this.exerciseService.findByLanguage(language);
  // }
}
