import { ArrayMinSize, IsArray, IsNotEmpty, ValidateNested } from "class-validator";
import { IsString } from "class-validator";
import { CreateExerciseDto } from "../../exercise/dto/create-exercise.dto";
import { codeDto, CreateAlgorithmDto } from "../../algorithm/dto/createAlgorithm.dto";
import { Type } from "class-transformer";

export class CreateContestExerciseDto extends CreateExerciseDto
{
    @IsString()
    @IsNotEmpty()
    contestId: string;
    @IsArray ()
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
