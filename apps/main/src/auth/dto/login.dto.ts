import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;



  
  @IsString()
  @IsNotEmpty()
  provider: string;
}