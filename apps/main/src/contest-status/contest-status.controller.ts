import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContestStatusService } from './contest-status.service';
import { CreateContestStatusDto } from './dto/create-contest-status.dto';
import { UpdateContestStatusDto } from './dto/update-contest-status.dto';

@Controller('contest-status')
export class ContestStatusController {
  constructor(private readonly contestStatusService: ContestStatusService) {}

  @Post()
  create(@Body() createContestStatusDto: CreateContestStatusDto) {
    return this.contestStatusService.create(createContestStatusDto);
  }

  @Get()
  findAll() {
    return this.contestStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contestStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContestStatusDto: UpdateContestStatusDto) {
    return this.contestStatusService.update(+id, updateContestStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contestStatusService.remove(+id);
  }
}
