import { IsEmail, IsString, IsNotEmpty, Matches, IsEnum } from 'class-validator';

export class VerifyDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otpCode: string;


}