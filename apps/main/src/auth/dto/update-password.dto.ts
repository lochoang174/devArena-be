import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdatePasswordDto {
  // @IsBoolean()
  // isCreatePassword: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Old password is required when creating a new password." })
  oldPassword?: string;

  @IsString()
  @IsNotEmpty({ message: "New password is required." })
  newPassword: string;
}
