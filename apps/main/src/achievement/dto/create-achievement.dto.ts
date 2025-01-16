import { IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsString, IsNumber, IsUrl } from 'class-validator';

export class CreateAchievementDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsEnum([25, 50, 75, 100, 125, 150], { message: 'requiredScore must be one of 25, 50, 75, 100, 125, or 150' })
    requiredScore?: number;

    @IsNotEmpty()
    @IsMongoId()
    courseId: string;

    @IsOptional()
    @IsString()
    @IsUrl({}, { message: 'image must be a valid URL' }) // Optional URL validation if you're storing the image as a URL
    image?: string;
}
