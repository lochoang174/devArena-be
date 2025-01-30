import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContestExerciseService } from './contest-exercise.service';
import { CreateContestExerciseDto } from './dto/create-contest-exercise.dto';
import { UpdateContestExerciseDto } from './dto/update-contest-exercise.dto';

@Controller('contest-exercise')
export class ContestExerciseController {
  constructor(private readonly contestExerciseService: ContestExerciseService) {}

  @Post()
  create(@Body() createContestExerciseDto: CreateContestExerciseDto) {
    return this.contestExerciseService.create(createContestExerciseDto);
  }

  @Get()
  findAll() {
    return this.contestExerciseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contestExerciseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContestExerciseDto: UpdateContestExerciseDto) {
    return this.contestExerciseService.update(+id, updateContestExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contestExerciseService.remove(+id);
  }
}
