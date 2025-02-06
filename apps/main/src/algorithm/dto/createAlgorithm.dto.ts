import { CreateExerciseDto } from "../../exercise/dto/create-exercise.dto";
import {
  IsArray,
  ValidateNested,
  IsString,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";

export class codeDto {
  @IsString()
  language: string;

  @IsString()
  code: string;
}

export class CreateAlgorithmDto extends CreateExerciseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => codeDto)
  solutions: codeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => codeDto)
  defaultCode: codeDto[];
}
