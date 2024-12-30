import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsObject,
  IsIn,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TestcaseDto } from './testcase.dto';
import { DifficultyEnum, PredefinedTags } from '../../schemas/exercise.schema';

// Custom validator to validate Map-like objects
class IsVariableTypeMap {
  validate(value: Record<string, string>): boolean {
    const validTypes = ['string', 'number', 'array'];
    return Object.values(value).every((type) => validTypes.includes(type));
  }

  defaultMessage(): string {
    return 'Each variable type must be "string", "number", or "array"';
  }
}

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional() // Optional field
  @IsIn(PredefinedTags, { each: true, message: 'Tags must be predefined values' })
  tags?: string[];

  @IsEnum(DifficultyEnum)
  difficulty: DifficultyEnum;

  @IsArray() // Testcases is an array
  @ValidateNested({ each: true }) // Validate each item in the array as a `TestcaseDto`
  @Type(() => TestcaseDto) // Transform plain objects into TestcaseDto instances
  testcases: TestcaseDto[];
}
