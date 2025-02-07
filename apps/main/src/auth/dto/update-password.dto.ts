import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdatePasswordDto {
  // @IsBoolean()
  // isCreatePassword: boolean;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsString()
  @IsNotEmpty({ message: "New password is required." })
  newPassword: string;
}
