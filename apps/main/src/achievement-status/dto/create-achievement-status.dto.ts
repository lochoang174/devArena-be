import { IsString } from "class-validator";

import { IsMongoId } from "class-validator";

import { IsNotEmpty } from "class-validator";

export class CreateAchievementStatusDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsMongoId()
    @IsNotEmpty()
    achievementId: string;
}
