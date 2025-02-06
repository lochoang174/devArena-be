import { IsString, IsOptional, Length, IsEmail } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @Length(2, 50)
    username?: string;

    @IsOptional()

    avatar?: string;



}