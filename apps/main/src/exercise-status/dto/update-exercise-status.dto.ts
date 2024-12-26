import { PartialType } from '@nestjs/mapped-types';
import { CreateExerciseStatusDto } from './create-exercise-status.dto';

export class UpdateExerciseStatusDto extends PartialType(CreateExerciseStatusDto) {}
