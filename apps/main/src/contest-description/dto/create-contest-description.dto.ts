import { IsString, IsDate, IsEnum, IsNotEmpty, IsOptional, IsDateString } from "class-validator";

export class CreateContestDescriptionDto {
  @IsString()
  @IsNotEmpty()
  contestName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsString()
  @IsOptional()
  image: string;

//   @IsEnum(["draft", "published", "completed"])
//   status: string = "draft";
}
