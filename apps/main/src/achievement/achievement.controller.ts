import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, UploadedFile, Put, NotFoundException, BadRequestException } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser, Roles } from '@app/common';
import { RolesGuard } from '../auth/guards/role.guard';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { CreateAchievementStatusDto } from '../achievement-status/dto/create-achievement-status.dto';
import { AchievementStatusService } from '../achievement-status/achievement-status.service';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService,
    private readonly achievementStatusService: AchievementStatusService,
  ) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './apps/main/uploads/achievements', // Directory to save the uploaded images
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml)$/)) {
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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.achievementService.getAchievementById(id);
  // }

  // get one  by refId and score
  @Get('refId/:refId/score/:score')
  async findOneByRefIdAndScore(@Param('refId') refId: string, @Param('score') totalScore: string, @CurrentUser() user) {
    const score = Number(totalScore);  // Convert to number explicitly
    if (isNaN(score)) {
      throw new BadRequestException('Invalid requiredScore value');
    }

    let requiredScore = 0;
    let yourScore = 0;
    let yourPreScore = 0;
    if (score < 25) {
      requiredScore = 25;
    } else if (score < 50) {
      yourPreScore = 25
      yourScore = 25;
      requiredScore = 50;
    } else if (score < 75) {
      yourPreScore = 25;
      yourScore = 50;
      requiredScore = 75;
    }
    else if (score < 100) {
      yourPreScore = 50;
      yourScore = 75;
      requiredScore = 100;
    }
    else if (score < 125) {
      yourPreScore = 75;
      yourScore = 100;
      requiredScore = 125;
    }
    else if (score < 150) {
      yourPreScore = 100;
      yourScore = 125;
      requiredScore = 150;
    }
    else {
      throw new BadRequestException('Invalid requiredScore value');
    }


    const achievement = await this.achievementService.findOneByRefIdAndScore(refId, requiredScore);
    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }

    if (score >= 25) {
      const yourPreAchievement = await this.achievementService.findOneByRefIdAndScore(refId, yourPreScore);
      if (!yourPreAchievement) {
        throw new NotFoundException('Your achievement not found');
      }

      const yourAchievement = await this.achievementService.findOneByRefIdAndScore(refId, yourScore);
      if (!yourAchievement) {
        throw new NotFoundException('Your achievement not found');
      }
      // Check if an achievement status for this user already exists
      const existingCurrentAchievementStatus = await this.achievementStatusService.findByUserIdAndAchievementId(
        user.id,
        yourAchievement._id.toString()
      );

      if (existingCurrentAchievementStatus) {
        return {
          achievement,
        }
      }

      // Check if an achievement status for the previous achievement exists
      const existingPreAchievementStatus = await this.achievementStatusService.findByUserIdAndAchievementId(
        user.id,
        yourPreAchievement._id.toString()
      );

      if (existingPreAchievementStatus) {
        // Update to the new achievement status
        const updateAchievementStatusDto: CreateAchievementStatusDto = {
          userId: user.id,
          achievementId: yourAchievement._id.toString(), // Convert ObjectId to string
        };
        await this.achievementStatusService.update(existingPreAchievementStatus._id.toString(), updateAchievementStatusDto);
      } else {
        // Create a new achievement status only if the previous one does not exist
        const createAchievementStatusDto: CreateAchievementStatusDto = {
          userId: user.id,
          achievementId: yourAchievement._id.toString(),
        };

        await this.achievementStatusService.create(createAchievementStatusDto);
      }
      return { achievement, yourPreAchievement };
    } else {
      return { achievement };

    }
  }

  @Get('refId/:refId')
  findAllByRefId(@Param('refId') refId: string) {
    return this.achievementService.findAllByRefId(refId);
  }


  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './apps/main/uploads/achievements',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml)$/)) {
          cb(new Error('Unsupported file type'), false);
        } else {
          cb(null, true);
        }
      },
    })
  )
  async updateAchievement(@Param('id') id: string, @UploadedFile() file: Express.Multer.File,
    @Body() updateAchievementDto: UpdateAchievementDto) {
    if (file) {
      // Fetch the current achievement details to get the old image
      const existingAchievement = await this.achievementService.getAchievementById(id);

      if (existingAchievement && existingAchievement.image) {
        // Construct the full path to the old image
        const oldImagePath = path.join('./uploads/achievements', existingAchievement.image);

        // Check if the old image exists and delete it
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update the DTO with the new file name
      updateAchievementDto.image = file.filename;
    }

    return this.achievementService.patch(id, updateAchievementDto);
  }

  @Delete('deleteAll')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async deleteAllAchievements() {
    //remove all images from the uploads folder
    const directory = './apps/main/uploads/achievements';
    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      }
    });


    return this.achievementService.deleteAll();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(['admin']) // Only admin can delete achievements
  async deleteAchievement(@Param('id') id: string) {
    // Fetch the existing achievement to get the image filename
    const existingAchievement = await this.achievementService.getAchievementById(id);

    if (!existingAchievement) {
      throw new NotFoundException('Achievement not found');
    }

    // Construct the path to the old image
    if (existingAchievement.image) {
      const oldImagePath = path.join('./apps/main/uploads/achievements', existingAchievement.image);

      // Check if the file exists and delete it
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Delete the achievement record from the database
    await this.achievementService.delete(id);

    return {
      message: 'Achievement deleted successfully',
    };
  }



}
