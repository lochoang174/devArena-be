import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { User } from "./user.schema";

export type AchievementStatusDocument = AchievementStatus & mongoose.Document;

@Schema()
export class AchievementStatus {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true })
    userId: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "AchievementModel", required: true })
    achievementId: string;
}

export const AchievementStatusSchema = SchemaFactory.createForClass(AchievementStatus);

AchievementStatusSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
