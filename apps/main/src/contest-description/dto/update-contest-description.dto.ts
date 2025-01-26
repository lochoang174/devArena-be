import { PartialType } from '@nestjs/mapped-types';
import { CreateContestDescriptionDto } from './create-contest-description.dto';

export class UpdateContestDescriptionDto extends PartialType(CreateContestDescriptionDto) {}
