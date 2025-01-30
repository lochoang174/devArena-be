import { PartialType } from '@nestjs/mapped-types';
import { CreateAchievementStatusDto } from './create-achievement-status.dto';

export class UpdateAchievementStatusDto extends PartialType(CreateAchievementStatusDto) {}
