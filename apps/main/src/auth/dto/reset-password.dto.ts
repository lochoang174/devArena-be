import { IsNotEmpty, IsString } from "class-validator";

export class ResetPassworDto{
    @IsString()
    @IsNotEmpty()
    token: string

    @IsString()
    @IsNotEmpty()
    newPassword: string
}