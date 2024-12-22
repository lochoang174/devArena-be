import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendDTO{
      @IsEmail()
      @IsNotEmpty()
      email: string;
}