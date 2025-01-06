import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";

import { IsString } from "class-validator";
import { Submission } from "../../schemas/submission.schema";

export class CreateExerciseStatusDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsMongoId()
    @IsNotEmpty()
    exerciseId: string;

    @IsOptional()
    @IsArray()
    submission: Submission[];
}
