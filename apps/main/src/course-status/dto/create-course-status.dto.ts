import { IsString } from "class-validator";

import { IsNotEmpty } from "class-validator";

export class CreateCourseStatusDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
