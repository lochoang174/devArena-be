import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, UploadedFile } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '@app/common';
import { RolesGuard } from '../auth/guards/role.guard';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/achievements', // Directory to save the uploaded images
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(new Error('Unsupported file type'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async create(
    @Body() createAchievementDto: CreateAchievementDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createAchievementDto.image = file.filename; // Save file path in DTO
    }
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
