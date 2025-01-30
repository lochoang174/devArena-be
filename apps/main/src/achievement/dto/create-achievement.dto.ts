import { ParseEnumPipe } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsString, IsNumber, IsUrl, ValidateIf, Matches, ValidatorConstraintInterface, ValidatorConstraint, ValidationArguments, Validate } from 'class-validator';
import { Types } from 'mongoose';
@ValidatorConstraint({ name: 'IsValidRefId', async: false })
export class IsValidRefIdConstraint implements ValidatorConstraintInterface {
    validate(value: string): boolean {
        // Allow "mastery" or a valid MongoID
        return value === 'algorithm' || Types.ObjectId.isValid(value);
    }

    defaultMessage(args: ValidationArguments): string {
        return 'refId must be "algorithm" or a valid MongoID';
    }
}

export class CreateAchievementDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsEnum([25, 50, 75, 100, 125, 150], {
        message: 'requiredScore must be one of 25, 50, 75, 100, 125, or 150',
    })
    requiredScore: number;

    @IsNotEmpty()
    @Validate(IsValidRefIdConstraint) // Use custom validation
    refId: string;

    @IsOptional()
    image: string;
}
