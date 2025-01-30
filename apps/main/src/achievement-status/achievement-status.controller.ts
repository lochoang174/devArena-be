import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AchievementStatusService } from './achievement-status.service';
import { CreateAchievementStatusDto } from './dto/create-achievement-status.dto';
import { UpdateAchievementStatusDto } from './dto/update-achievement-status.dto';

@Controller('achievement-status')
export class AchievementStatusController {
  constructor(private readonly achievementStatusService: AchievementStatusService) { }

  @Post()
  create(@Body() createAchievementStatusDto: CreateAchievementStatusDto) {
    return this.achievementStatusService.create(createAchievementStatusDto);
  }

  @Get()
  findAll() {
    return this.achievementStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.achievementStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAchievementStatusDto: UpdateAchievementStatusDto) {
    return this.achievementStatusService.update(id, updateAchievementStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.achievementStatusService.remove(+id);
  }
}
