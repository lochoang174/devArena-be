import { PartialType } from '@nestjs/mapped-types';
import { CreateContestExerciseDto } from './create-contest-exercise.dto';

export class UpdateContestExerciseDto extends PartialType(CreateContestExerciseDto) {}
