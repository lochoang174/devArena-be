import { IsString, IsNotEmpty, IsMongoId } from "class-validator";
import { CreateExerciseDto } from "../../exercise/dto/create-exercise.dto";
import { isValidObjectId, Types } from "mongoose";

export class CreateStudyDto extends CreateExerciseDto {


  @IsString()
  @IsNotEmpty()
  sampleCode: string;

  @IsString()
  @IsNotEmpty()
  solution: string;

  
  @IsMongoId()
  @IsNotEmpty()
  courseId: Types.ObjectId;



  
}
