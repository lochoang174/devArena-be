import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContestDescriptionService } from './contest-description.service';
import { CreateContestDescriptionDto } from './dto/create-contest-description.dto';
import { UpdateContestDescriptionDto } from './dto/update-contest-description.dto';

@Controller('contest-description')
export class ContestDescriptionController {
  constructor(private readonly contestDescriptionService: ContestDescriptionService) {}

  @Post()
  create(@Body() createContestDescriptionDto: CreateContestDescriptionDto) {
    return this.contestDescriptionService.create(createContestDescriptionDto);
  }

  @Get()
  findAll() {
    return this.contestDescriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contestDescriptionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContestDescriptionDto: UpdateContestDescriptionDto) {
    return this.contestDescriptionService.update(id, updateContestDescriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contestDescriptionService.remove(id);
  }
}
