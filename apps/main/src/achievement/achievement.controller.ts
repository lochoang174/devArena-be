import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) { }

  @Post()
  // @UseInterceptors(FileInterceptor('file'))
  async create(@Body() createAchievementDto: CreateAchievementDto) {
    return await this.achievementService.create(createAchievementDto);
  }

  @Get()
  findAll() {
    return this.achievementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.achievementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAchievementDto: UpdateAchievementDto) {
    return this.achievementService.update(+id, updateAchievementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.achievementService.remove(+id);
  }
}
