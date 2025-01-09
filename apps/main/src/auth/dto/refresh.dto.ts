import { IsString } from "class-validator";

export class refreshDto{
    @IsString()
    refreshToken: string
}