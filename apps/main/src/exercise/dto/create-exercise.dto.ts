import { IsEnum, IsNotEmpty, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { DifficultyEnum, LanguageEnum } from '../schema/exercise.schema';
import { TestcaseDto } from './testcase.dto';
import { Type } from 'class-transformer';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(LanguageEnum)
  language: LanguageEnum;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional() // Cho phép trường này không bắt buộc
  tags?: string[];

  @IsEnum(DifficultyEnum)
  difficulty: DifficultyEnum;

  @IsArray() // Testcases is an array
  @ValidateNested({ each: true }) // Validate each item in the array as a `TestcaseDto`
  @Type(() => TestcaseDto) // Transform plain objects into TestcaseDto instances
  testcases: TestcaseDto[];
}
