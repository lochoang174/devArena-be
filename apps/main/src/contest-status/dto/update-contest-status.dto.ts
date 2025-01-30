import { PartialType } from '@nestjs/mapped-types';
import { CreateContestStatusDto } from './create-contest-status.dto';

export class UpdateContestStatusDto extends PartialType(CreateContestStatusDto) {}
